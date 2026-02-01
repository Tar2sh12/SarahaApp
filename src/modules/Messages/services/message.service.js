import { Message } from "../../../../DB/models/index.js";
import { successResponse } from "../../../utils/index.js";

export const getAllMessages = async (req, res) => {
  const {id} = req.params;
  const messages = await Message.find({ orderId: id }).populate("senderId repliedTo","-password -__v -emailVerificationToken -passwordResetToken -isDeleted -deletedAt -createdAt -updatedAt -permissions");
  return successResponse(res, messages, "messages returned successfully", 200);
};