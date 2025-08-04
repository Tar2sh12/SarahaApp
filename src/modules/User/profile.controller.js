import * as controller from "./services/profile.service.js";
// middlewares
import * as Middlewares from "../../middleware/index.js";
// utils
import { extensions } from "../../utils/index.js";
import { Router } from "express";
import {
  createUserSchema,
  getInfoSchema,
  deleteUserSchema,
  loginSchema,
  getAllInfoSchema,
} from "../../validators/profile.schema.js";
const UserRouter = Router();
const { errorHandler, auth, validationMiddleware, authorizationMiddleware } =
  Middlewares;
import { systemRoles } from "../../utils/index.js";
import { User } from "../../../DB/models/user.model.js";

UserRouter.get(
  "/getInfo",
  errorHandler(auth()),
  errorHandler(validationMiddleware(getInfoSchema)),
  errorHandler(controller.getInfo)
);
UserRouter.get(
  "/getAllUsers",
  errorHandler(auth()),
  errorHandler(authorizationMiddleware(systemRoles.ADMIN)),
  errorHandler(validationMiddleware(getAllInfoSchema)),
  errorHandler(controller.getAllUsers)
);
UserRouter.delete(
  "/deleteUser/:id",
  errorHandler(auth()),
  errorHandler(authorizationMiddleware(systemRoles.ADMIN)),
  errorHandler(validationMiddleware(deleteUserSchema)),
  errorHandler(controller.deleteUser)
);

UserRouter.patch("/updaate-password",
  errorHandler(auth()),
  errorHandler(controller.updatePasswordService)
);

UserRouter.put("/update-profile",
  errorHandler(auth()),
  errorHandler(controller.updateProfile)
);

export { UserRouter };
