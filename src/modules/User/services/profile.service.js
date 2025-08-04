import { User, BlacklistToken } from "../../../../DB/models/index.js";
import {
  Decryption,
  Encryption,
  ErrorClass,
  successResponse,
  generateToken,
  emailTemplate,
} from "../../../utils/index.js";
import { compareSync } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import emitter from "../../../Services/send-email.service.js";
/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response { user}
 * @description get user information
 */
export const getInfo = async (req, res, next) => {
  const { authUser } = req;
  // return user information except password and _id and otp and updatedAt
  const user = await User.findOne({
    _id: authUser._id,
    isMarkedAsDeleted: false,
    isEmailVerified: true,
  }).select(
    "-password -_id -otp -updatedAt -__v -isMarkedAsDeleted -isEmailVerified"
  );
  user.phone = await Decryption({
    cipher: user.phone,
    secretKey: process.env.SECRET_ENCRYPTION_KEY,
  });

  return successResponse(res, user, "User information", 200);
};

//get all users
/**
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns return response [{user}]
 * @description get all users except current user
 */
export const getAllUsers = async (req, res, next) => {
  // find all users except current user
  const { authUser } = req;
  if (authUser.createdBy == null || authUser.createdBy == undefined) {
    const user = await User.find({ isMarkedAsDeleted: false }).select(
      "-password -_id -otp -updatedAt -__v"
    );
    return successResponse(res, user, "All users", 200);
  } else {
    const user = await User.find({
      isMarkedAsDeleted: false,
      createdBy: authUser._id,
    }).select("-password -_id -otp -updatedAt -__v");
    return successResponse(res, user, "All users", 200);
  }
};

export const deleteUser = async (req, res, next) => {
  const { authUser } = req;
  const { id } = req.params;
  if (authUser.createdBy == null || authUser.createdBy == undefined) {
    const user = await User.findByIdAndUpdate(
      id,
      { isMarkedAsDeleted: true },
      { new: true }
    );
    return successResponse(res, user, "user deleted", 200);
  }
  const user = await User.findOneAndUpdate(
    { _id: id, createdBy: authUser._id },
    { isMarkedAsDeleted: true },
    { new: true }
  );
  if (!user) {
    return next(
      new ErrorClass(
        "User not found or you are not authorized",
        404,
        "User not found or you are not authorized"
      )
    );
  }
  return successResponse(res, user, "user deleted", 200);
};

export const updatePasswordService = async (req, res, next) => {
  const { authUser } = req;
  const { newPassword, oldPassword, confirmPassword } = req.body;
  const token = req.originalToken.originalToken;
  if (newPassword !== confirmPassword) {
    return next(
      new ErrorClass(
        "New password and confirm password must be same",
        400,
        "New password and confirm password must be same"
      )
    );
  }
  //find logged in user
  const user = await User.findById(authUser._id);
  if (!user) {
    return next(new ErrorClass("User not found", 404, "User not found"));
  }
  //compare with saved hashed password
  const isMatch = compareSync(oldPassword, user.password);
  if (!isMatch) {
    return next(
      new ErrorClass(
        "Old password is incorrect",
        400,
        "Old password is incorrect"
      )
    );
  }
  //update password and the pre save hook will hash the new password
  user.password = newPassword;
  await user.save();

  //add the token id and exp to black lisk
  const blackListToken = new BlacklistToken({
    tokenId: req.originalToken.tokenId,
    expiresAt: req.originalToken.exp,
  });
  await blackListToken.save();

  return successResponse(
    res,
    "Password updated successfully",
    "Password updated successfully",
    200
  );
};

export const updateProfile = async (req, res, next) => {
  const { authUser } = req;
  const { userName, email, phone } = req.body;
  const user = await User.findById(authUser._id);
  if (!user) {
    return next(new ErrorClass("User not found", 404, "User not found"));
  }
  if (userName) user.userName = userName;
  if (phone)
    user.phone = Encryption({
      plain: phone,
      secretKey: process.env.SECRET_ENCRYPTION_KEY,
    });
  if (email) {
    //check if the new email already used
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      return next(
        new ErrorClass("Email already exists", 400, "Email already exists")
      );
    }
    //confirmation token
    const confirmationToken = generateToken({
      publicClaims: { user: { email } },
      registeredClaims: {
        expiresIn: process.env.CONFIRM_EMAIL_EXPIRATION_TIME,
        jwtid: uuidv4(),
      },
      secretKey: process.env.CONFIRM_TOKEN,
    });

    //generate confirmation link
    const confirmationLink = `${req.protocol}://${req.headers.host}/auth/confirmation/${confirmationToken}`; // this link should be a front end page link because of we don't have a front end yet we will make it a link of the api that will make the isEmailVerified flag to true
    //emit SendEmail event
    emitter.emit("SendEmail", {
      to: email,
      subject: "update Saraha email confirmation",
      htmlMessage: emailTemplate({
        message: { text: "Welcome", data: confirmationLink },
        subject: "update email confirmation",
      }),
    });
    user.email = email;
    user.isEmailVerified = false;
  }
  await user.save();
  return successResponse(
    res,
    "Profile updated successfully",
    "Profile updated successfully",
    200
  );
};
