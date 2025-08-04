import * as controller from "./Services/authentication.service.js";
// middlewares
import * as Middlewares from "../../middleware/index.js";
// utils
import { extensions } from "../../utils/index.js";
import { Router } from "express";
import {
  createUserSchema,
  loginSchema,
} from "../../validators/auth.validator.js";
const AuthRouter = Router();
const { errorHandler, auth, validationMiddleware, authorizationMiddleware } =
  Middlewares;
import { systemRoles } from "../../utils/index.js";
AuthRouter.post(
  "/signUp",
  errorHandler(validationMiddleware(createUserSchema)),
  errorHandler(controller.SignUp)
);
AuthRouter.post(
  "/login",
  errorHandler(validationMiddleware(loginSchema)),
  errorHandler(controller.login)
);


AuthRouter.get(// this route should be patch because the frontend is not ready yet and we want to access it quickly through the mail 
  "/confirmation/:confirmationToken",
  errorHandler(controller.verifyEmail)
);


AuthRouter.post("/refresh-token",  errorHandler(controller.refreshTokenService));

AuthRouter.post("/sign-out", errorHandler(auth()), errorHandler(controller.signOutService));

AuthRouter.patch("/forget-password", errorHandler(controller.forgetPassowrdService));

AuthRouter.put("/reset-password", errorHandler(controller.resetPasswordService));
export { AuthRouter };
