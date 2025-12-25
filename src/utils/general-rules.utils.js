import Joi from "joi";
import { Types } from "mongoose";

const objectIdValidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value);
  return isValid ? value : helper.message("Invalid ObjectId");
};

export const generalRules = {
  _id: Joi.string().custom(objectIdValidation),
  headers: {
   "content-type": Joi.string(),
  accept: Joi.string(),
  "accept-encoding": Joi.string(),
  host: Joi.string(),
  "content-length": Joi.number().optional(),
  "user-agent": Joi.string(),
  "accept-language": Joi.string(),
  "accept-charset": Joi.string(),
  "postman-token": Joi.string(),
  "postman-id": Joi.string(),
  connection: Joi.string(),
  "cache-control": Joi.string(),
  "sec-ch-ua-platform": Joi.string(),
  "sec-ch-ua-mobile": Joi.string(),
  "sec-ch-ua": Joi.string(),
  "sec-fetch-dest": Joi.string(),
  "sec-fetch-mode": Joi.string(),
  "sec-fetch-site": Joi.string(),
  "sec-fetch-user": Joi.string(),
  "upgrade-insecure-requests": Joi.string(),
  "x-forwarded-for": Joi.string(),
  origin: Joi.string(),
  referer: Joi.string(),
  "if-none-match": Joi.string().optional(),
  "x-real-ip": Joi.string(),
  "x-forwarded-proto": Joi.string(),
  "cf-ray": Joi.string(),
  "cdn-loop": Joi.string(),
  cookie: Joi.string(),
  priority: Joi.string(),
  "cf-visitor": Joi.string(),
  "cf-connecting-ip": Joi.string(),
  "cf-ipcountry": Joi.string(),
  "sec-gpc": Joi.string(),
  },
  email: Joi.string().email({
    minDomainSegments: 2,
  }),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$!%*?&])[A-Za-z\d$!%*?&]{8,}$/
    )
    .messages({
      "string.pattern.base":
        "Password must have at least one lowercase letter, one uppercase letter, one number and one special character",
      "any.required": "You need to provide a password",
      "string.min": "Password should have a minimum length of 3 characters",
    }),
};
