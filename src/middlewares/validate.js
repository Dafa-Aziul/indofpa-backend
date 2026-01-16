import { validationResult } from "express-validator";
import ApiError from "../utils/apiError.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = {};
    errors.array().forEach(err => {
      formatted[err.path] = err.msg;
    });

    throw new ApiError(422, "Validasi gagal", formatted);
  }

  next();
};
