//import joi
import Joi from "joi";
import {  systemRoles } from "../utils/index.js";
import { generalRules } from "../utils/general-rules.utils.js";
export const createUserSchema = {
  body: Joi.object({
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    userType: Joi.string().valid(...Object.values(systemRoles)),
  }),
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

export const getInfoSchema = {
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
};

export const getAllInfoSchema = {
    headers: Joi.object({
      token: Joi.string().required(),
      ...generalRules.headers,
    }),
  };

export const deleteUserSchema = {
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const updateInfoSchema = {
  body: Joi.object({
    userName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    userType: Joi.string()
      .valid(...Object.values(systemRoles))
      .optional(),
  }),
  headers: Joi.object({
    token: Joi.string().required(),
    ...generalRules.headers,
  }),
};

// export const forgetPasswordSchema = {
//   body: Joi.object({
//     email: Joi.string().required(),
//   }),
// };


// export const changePasswordSchema = {
//   body: Joi.object({
//     email: Joi.string().required(),
//     password: Joi.string().required(),
//     otp: Joi.string().required(),
//   }),
// }