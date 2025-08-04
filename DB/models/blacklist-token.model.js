import mongoose from "mongoose";
const { Schema, model } = mongoose;

const blacklistTokenSchema = new Schema(
  {
    tokenId: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: String, // will use luxon
      required: true,
    },
  },
  { timestamps: true }
);

export const BlacklistToken =
  mongoose.models.BlacklistToken ||
  model("BlacklistToken", blacklistTokenSchema);
