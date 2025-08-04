import mongoose from "mongoose";
import { systemRoles } from "../../src/utils/index.js";
import { hashSync, compareSync } from "bcrypt";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: String,
    userType: {
      type: String,
      enum: Object.values(systemRoles), //admin - network - customer_support - technical_support - accounting
      required: true,
    },
    otp: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMarkedAsDeleted: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);
userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = hashSync(this.password, +process.env.SALT_ROUNDS);
  }
  next();
});
export const User = mongoose.models.User || model("User", userSchema);
