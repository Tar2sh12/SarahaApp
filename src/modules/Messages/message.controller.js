//message router
import * as controller from "./services/message.service.js";
// middlewares
import * as Middlewares from "../../middleware/index.js";
import { Router } from "express";
const MessageRouter = Router();
const { errorHandler, auth } = Middlewares;
MessageRouter.post(
  "/send-message",
  errorHandler(controller.sendMessageService)
);
MessageRouter.get(
  "/get-my-messages",
  errorHandler(auth()),
  errorHandler(controller.getLoggedInUserMessagesService)
);

MessageRouter.get(
  "/get-paginate",
  errorHandler(auth()),
  errorHandler(controller.getPaginatedMessages)
);
export { MessageRouter };
