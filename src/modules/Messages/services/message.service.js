import { Message, User } from "../../../../DB/models/index.js";
import { successResponse, ApiAggregateFeature,ApiFeature } from "../../../utils/index.js";

// send message
export const sendMessageService = async (req, res, next) => {
  const { message, userId } = req.body;
  const user = await User.findOne({ _id: userId });
  if (!user) {
    return next(new ErrorClass("User not found", 404, "User not found"));
  }
  const messageInstance = new Message({ message, userId });
  await messageInstance.save();
  return successResponse(
    res,
    messageInstance,
    "Message sent successfully",
    200
  );
};

export const getLoggedInUserMessagesService = async (req, res, next) => {
  var select = {
    "user.password": 0,
    "user.userType": 0,
    "user.isEmailVerified": 0,
    "user.isMarkedAsDeleted": 0,
    "user.createdAt": 0,
    "user.updatedAt": 0,
    "user.__v": 0,
  };

  const list = new ApiAggregateFeature(
    Message,
    req.query,
    [
      {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    ],
    select
  )
    .pagination()
    .populateFields()
    .filters()
    .sort();
  const result = await list.execute();
  return successResponse(res, result, "Messages fetched successfully", 200);
  // const messages = await Message.aggregate([
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "userId",
  //       foreignField: "_id",
  //       as: "user",
  //   }},
  //   {
  //     $unwind: {
  //       path: "$user",
  //       preserveNullAndEmptyArrays: true,
  //     }
  //   },
  //   {
  //     $match:{
  //       "user.userName":{$regex:"mo",$options:"i"}
  //     }
  //   }
  // ])
  // return successResponse(res, messages, "Messages returned successfully", 200);
};

export const getPaginatedMessages = async (req, res, next) => {
  var select = "-__v -createdAt -updatedAt -customerName";

  const list = new ApiFeature(
    Message,
    req.query,
    [
      { path: "userId", select: "-__v -createdAt -updatedAt" },
    ],
    select
  )
    .pagination()
    .populateFields()
    .filters()
    .sort();
  const messages = await list.mongooseQuery;
  return successResponse(
    res,
    messages,
    "messages returned successfully",
    200
  );
};

