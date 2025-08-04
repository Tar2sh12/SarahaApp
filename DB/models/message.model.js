import mongoose from "mongoose";
const { Schema, model } = mongoose;
const messageSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
export const Message =
  mongoose.models.Message || model("Message", messageSchema);
