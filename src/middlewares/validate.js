import { validationResult } from "express-validator";
import ApiError from "../utils/apiError.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format ulang error menjadi object key:value
    const formatted = {};
    errors.array().forEach(err => {
      formatted[err.path] = err.msg;
    });

    throw new ApiError(422, "Validasi gagal", formatted);
  }

  next();
};
