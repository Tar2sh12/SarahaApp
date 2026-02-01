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


  // socket io events
  io.on("connection", (socket) => {
    console.log("a user connected");
    // user enters order room
    socket.on("userEntersOrderRoom", (data) => {
      // data should contain user id and order id
      socket.join(data.orderId);
    });
    //send message to specific room
    socket.on("sendMessageToRoom", async (data) => {
      console.log(data);
      
      // save message to db
      const newMessage = new Message({
        orderId: data.orderId,
        senderId: data.userId,
        content: data.message,
        repliedTo: data.repliedTo || null,
      });
      await newMessage.save();
      io.to(data.orderId).emit("newMessage", newMessage);
    });
    // user disconnects
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
