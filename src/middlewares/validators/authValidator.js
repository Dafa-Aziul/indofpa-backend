import { body, validationResult } from "express-validator";
import ApiError from "../../utils/apiError.js";

export const validateLogin = [
  // Rules
  body("email")
    .notEmpty().withMessage("Email wajib diisi")
    .isEmail().withMessage("Format email tidak valid"),

  body("password")
    .notEmpty().withMessage("Password wajib diisi"),

  // Handler
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Format ulang error menjadi object per-field
      const formattedErrors = {};
      errors.array().forEach(err => {
        formattedErrors[err.path] = err.msg;
      });

      // Lempar ke global error handler
      throw new ApiError(422, "Validasi gagal", formattedErrors);
    }

    next();
  }
];

export const changePasswordValidator = [

  body("currentPassword")
    .notEmpty()
    .withMessage("Password lama wajib diisi"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter"),

  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Konfirmasi password tidak sama");
      }
      return true;
    })

];