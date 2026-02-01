import mongoose from "mongoose";
const { Schema, model } = mongoose;
const messageSchema = new Schema(
  {
    orderId: {
      type: String
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    readBy: [],
    repliedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: { type: Date, default: null },
    isEdited: {
      type: Boolean,
      default: false,
    },
    reactions: [
      {
        emoji: String,
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      },
    ],
  },
  {
    timestamps: true, 
  },
);

export const Message =
  mongoose.model("Message", messageSchema) || model("Message", messageSchema);
