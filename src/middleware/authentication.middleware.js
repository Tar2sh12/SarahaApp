import jwt from "jsonwebtoken";
import {BlacklistToken, User} from "../../DB/models/index.js";
import { ErrorClass } from "../utils/index.js";

/**
 * @returns {function} return middleware function
 * @description Check if the user is authenticated or not
 */
export const auth = () => {
  return async (req, res, next) => {
    // destruct token from headers
    const { token } = req.headers;
    
    // check if token is exists
    if (!token) {
      return next(
        new ErrorClass("Token is required", 404, "Token is required")
      );
    }
    // check if token starts with prefix
    if (!token.startsWith(process.env.PREFIX_SECRET)) {
      return next(new ErrorClass("Invalid tokenn", 400, "Invalid tokenn"));
    }
    // retrieve original token after adding the prefix
    const originalToken = token.split(" ")[1];

    // verify token
    const data = jwt.verify(originalToken, process.env.LOGIN_SECRET);
    // check if token payload has userId
    
    if (!data?.userId) {
      return next(
        new ErrorClass("Invalid token payload", 400, "Invalid token payload")
      );
    }
    // check if the token is blacklisted 
    const isTokenBlackListed = await BlacklistToken.findOne({ tokenId: data.jti });
    if(isTokenBlackListed) {
      return next(new ErrorClass("User has logged out", 400, "User has logged out"));
    }

    
    // find user by userId
    const isUserExists = await User.findById(data?.userId);
    if (!isUserExists || isUserExists.isMarkedAsDeleted) {
      return next(new ErrorClass("User not found or you must logIn", 404, "User not found"));
    }
    // add the user data in req object
    req.authUser = isUserExists;
    req.originalToken = {originalToken,tokenId:data.jti,exp:data.exp};
    next();
  };
};