import { BlacklistToken, User } from "../../../../DB/models/index.js";
import {
  ErrorClass,
  successResponse,
  emailTemplate,
} from "../../../utils/index.js";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { Encryption } from "../../../utils/index.js";
import emitter from "../../../Services/send-email.service.js";
import { v4 as uuidv4 } from "uuid";

/**
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message,userInstance,statusCode }
 * @description sign up
 */
export const SignUp = async (req, res, next) => {
  const { userName, email, password, userType, phone } = req.body;
  const isEmailExist = await User.findOne({ email });
  if (isEmailExist) {
    return next(
      new ErrorClass("Email already exists", 400, "Email already exists")
    );
  }
  //encrypt phone
  const encryptedPhone = await Encryption({
    plain: phone,
    secretKey: process.env.SECRET_ENCRYPTION_KEY,
  });

  const userInstance = new User({
    userName,
    email,
    userType,
    password,
    phone: encryptedPhone
  });

  //confirmation token
  const confirmationToken = jwt.sign(
    { user: userInstance },
    process.env.CONFIRM_TOKEN,
    { expiresIn: "1d" }
  );

  //emit SendEmail event
  const confirmationLink = `${req.protocol}://${req.headers.host}/auth/confirmation/${confirmationToken}`; // this link should be a front end page link because of we don't have a front end yet we will make it a link of the api that will make the isEmailVerified flag to true
  emitter.emit("SendEmail", {
    to: email,
    subject: "Welcome to Hamsolah",
    htmlMessage: emailTemplate({
      message: { text: "Welcome to Hamsolah", data: confirmationLink },
      subject: "Welcome to saraha app",
    }),
  });

  await userInstance.save();
  return successResponse(res, userInstance, "user created ", 201);
};

export const verifyEmail = async (req, res, next) => {
  const { confirmationToken } = req.params;
  const user = jwt.verify(confirmationToken, process.env.CONFIRM_TOKEN).user;
  const email = user.email;

  const isEmailVerified = await User.findOneAndUpdate(
    { email },
    { isEmailVerified: true },
    { new: true }
  );
  if (!isEmailVerified) {
    return next(new ErrorClass("User not found", 404, "User not found"));
  }
  return successResponse(res, isEmailVerified, "Email verified", 200);
};

/**
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response {message, token}
 * @description login user
 */

export const login = async (req, res, next) => {
  // destruct email and password from req.body
  const { email, password } = req.body;
  // find user
  const user = await User.findOne({ email, isMarkedAsDeleted: false ,isEmailVerified:true});

  
  if (!user) {
    return next(
      new ErrorClass(
        "Invalid credentials or user is deleted",
        400,
        "Invalid credentials or user is deleted"
      )
    );
  }

  // compare password
  const isMatch = compareSync(password, user.password);
  
  if (!isMatch) {
    return next(
      new ErrorClass("Invalid credentials", 400, "Invalid credentials")
    );
  }

  // generate the access token && refresh token
  const accessToken = jwt.sign(
    {
      userId: user._id,
      role: user.userType,
      userName: user.userName,
      email: user.email,
    },
    process.env.LOGIN_SECRET,
    {
      expiresIn: "1h",
      jwtid: uuidv4(), //generate id to use it as jwtid
    }
  );

  //! refreshtoken
  const refreshToken = jwt.sign(
    {
      userId: user._id,
      role: user.userType,
      userName: user.userName,
      email: user.email,
    },
    process.env.REFRESH_TOKEN,
    {
      expiresIn: "2d",
      jwtid: uuidv4(), //generate id to use it as jwtid
    }
  );

  const returnedUser = {
    userName: user.userName,
    email: user.email,
    userType: user.userType,
  };
  const data = {
    accessToken,
    refreshToken,
    user: returnedUser,
  };

  // response
  return successResponse(res, data, "Login success", 200);
};

//! refreshtoken
export const refreshTokenService = async (req, res, next) => {
  const { refreshtoken } = req.headers;
  const decodedData = jwt.verify(refreshtoken, process.env.REFRESH_TOKEN);
  const accessToken = jwt.sign(
    {
      userId: decodedData.userId,
      role: decodedData.userType,
      userName: decodedData.userName,
      email: decodedData.email,
    },
    process.env.LOGIN_SECRET,
    {
      expiresIn: "1h",
      jwtid: uuidv4(),
    }
  );
  return successResponse(res, {accessToken:accessToken}, "Token refreshed", 200);
};


//! refreshtoken
export const signOutService = async (req, res, next) => {
  const {  refreshtoken } = req.headers;
  const token = req.originalToken.originalToken ;
  const decodedData = jwt.verify(token, process.env.LOGIN_SECRET);
  const decodedRefreshToken = jwt.verify(
    refreshtoken,
    process.env.REFRESH_TOKEN
  );
  
  const revokedToken = await BlacklistToken.insertMany([
    { tokenId: decodedData.jti, expiresAt: decodedData.exp },
    { tokenId: decodedRefreshToken.jti, expiresAt: decodedRefreshToken.exp },
  ]);
  return successResponse(res, revokedToken, "sign out successfully", 200);
};


export const forgetPassowrdService = async (req, res, next) => {
  const {email} = req.body;
  const user = await User.findOne({email});
  if(!user){
    return next(new ErrorClass("User not found", 404, "User not found"));
  }
  //generate otp code
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });
  user.otp = hashSync(otp, +process.env.SALT_ROUNDS);
  await user.save();
  emitter.emit("SendEmail", {
    to: user.email, // we user user.email instead of email to ensure the single source of truth concept 
    subject: "Reset Password",
    htmlMessage: `<h1">your otp is ${otp}</h1>`,
  });
  return successResponse(res, "Otp sent through email", "Email sent successfully", 200);
};



export const resetPasswordService = async (req, res, next) => {
  const {email , otp , password} = req.body;
  const user = await User.findOne({email});
  if(!user){
    return next(new ErrorClass("User not found", 404, "User not found"));
  }
  const isMatch = compareSync(otp, user.otp);
  if(!isMatch){
    return next(new ErrorClass("Invalid otp", 400, "Invalid otp"));
  }
  await User.updateOne({email},{password:hashSync(password, +process.env.SALT_ROUNDS),$unset:{otp:""}});
  return successResponse(res, "Password reset successfully", "Password reset successfully", 200);
}

