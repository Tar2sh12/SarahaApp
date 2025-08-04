import Joi from "joi";
import {  systemRoles } from "../utils/index.js";
import { generalRules } from "../utils/general-rules.utils.js";
export const createUserSchema = {
  body: Joi.object({
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    userType: Joi.string().valid(...Object.values(systemRoles)),
    phone: Joi.string(),
  })
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};