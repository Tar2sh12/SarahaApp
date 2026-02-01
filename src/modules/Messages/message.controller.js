import * as controller from "./Services/message.service.js";
// middlewares
import * as Middlewares from "../../middleware/index.js";
import { Router } from "express";
const MessageRouter = Router();
const { errorHandler,} =
  Middlewares;

MessageRouter.get(
  "/getOrderMessages/:id",
  errorHandler(controller.getAllMessages)
);



export { MessageRouter };