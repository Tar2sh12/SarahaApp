import express from "express";
import { config } from "dotenv";

import { db_connection } from "./DB/connection.js";

import {
  cronJobForRemovingEpiredTokens
} from "./src/utils/index.js";
import { gracefulShutdown } from "node-schedule";
import { routerHandler } from "./router-handler.js";
import {  socketConnection } from "./src/utils/index.js";
import { Message } from "./DB/models/index.js";
export const main = () => {

  const app = express();

  config();
  
  const port = process.env.PORT;

  routerHandler(app);

  db_connection();

  cronJobForRemovingEpiredTokens();
  gracefulShutdown();

  app.get("/", (req, res) => res.send("Hello World!"));
  const serverApp = app.listen(port, () =>
    console.log(`Example app listening on port ${port}!`)
  );
  // socket io setup
  const io = socketConnection(serverApp);

  // Track users in rooms
  const roomUsers = {};

  // socket io events
  io.on("connection", (socket) => {
    console.log("a user connected");

    // Join a global room for this user to receive private notifications
    socket.on("joinGlobalRoom", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their global room`);
      }
    });

    // user enters order room
    socket.on("userEntersOrderRoom", (data) => {
      const { orderId, userId } = data;
      socket.join(orderId);
      socket.userId = userId;
      socket.orderId = orderId;

      if (!roomUsers[orderId]) {
        roomUsers[orderId] = new Map();
      }

      // Track user and their socket count (in case multiple tabs)
      const usersInRoom = roomUsers[orderId];
      usersInRoom.set(userId, (usersInRoom.get(userId) || 0) + 1);

      // Notify room about updated user count/list
      io.to(orderId).emit("roomUsersUpdate", {
        count: usersInRoom.size,
        users: Array.from(usersInRoom.keys())
      });
    });

    //send message to specific room
    socket.on("sendMessageToRoom", async (data) => {
      const newMessage = new Message({
        orderId: data.orderId,
        senderId: data.userId,
        content: data.message,
        repliedTo: data.repliedTo || null,
        readBy: [data.userId] // Sender has read their own message
      });
      await newMessage.save();
      const populatedMessage = await Message.findById(newMessage._id).populate([
        { path: "senderId", select: "username _id role" },
        { path: "repliedTo", select: "username _id content" },
        { path: "orderId", select: "orderType" }
      ]);

      // Emit to the specific order room
      io.to(data.orderId).emit("newMessage", populatedMessage);

      // Emit global notification to everyone else
      socket.broadcast.emit("globalNewMessage", populatedMessage);
    });

    // toggle reaction on message
    socket.on("toggleReaction", async (data) => {
      const { messageId, userId, emoji, orderId } = data;
      const message = await Message.findById(messageId);
      if (!message) return;

      if (!message.reactions) message.reactions = [];

      // Find if user already has ANY reaction
      let existingReactionIndex = -1;
      let existingUserIndex = -1;

      message.reactions.forEach((r, rIdx) => {
        const uIdx = r.users.findIndex(u => u.toString() === userId.toString());
        if (uIdx > -1) {
          existingReactionIndex = rIdx;
          existingUserIndex = uIdx;
        }
      });

      if (existingReactionIndex > -1) {
        const oldEmoji = message.reactions[existingReactionIndex].emoji;

        // Remove the existing reaction
        message.reactions[existingReactionIndex].users.splice(existingUserIndex, 1);
        if (message.reactions[existingReactionIndex].users.length === 0) {
          message.reactions.splice(existingReactionIndex, 1);
        }

        // If the new emoji is DIFFERENT from the old one, add the new reaction
        if (oldEmoji !== emoji) {
          const newReactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
          if (newReactionIndex > -1) {
            message.reactions[newReactionIndex].users.push(userId);
          } else {
            message.reactions.push({ emoji, users: [userId] });
          }
        }
        // If it was the SAME emoji, we just leave it removed (toggle off)
      } else {
        // No existing reaction, just add the new one
        const newReactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
        if (newReactionIndex > -1) {
          message.reactions[newReactionIndex].users.push(userId);
        } else {
          message.reactions.push({ emoji, users: [userId] });
        }
      }

      await message.save();
      const updatedMessage = await Message.findById(messageId).populate({
        path: "reactions.users",
        select: "username role"
      });

      io.to(orderId).emit("reactionUpdate", { messageId, reactions: updatedMessage.reactions });
    });

    // user disconnects
    socket.on("disconnect", () => {
      console.log("user disconnected");
      const { orderId, userId } = socket;

      if (orderId && userId && roomUsers[orderId]) {
        const usersInRoom = roomUsers[orderId];
        const count = usersInRoom.get(userId);

        if (count > 1) {
          usersInRoom.set(userId, count - 1);
        } else {
          usersInRoom.delete(userId);
        }

        if (usersInRoom.size === 0) {
          delete roomUsers[orderId];
        } else {
          io.to(orderId).emit("roomUsersUpdate", {
            count: usersInRoom.size,
            users: Array.from(usersInRoom.keys())
          });
        }
      }
    });
  });
};
