import { error } from "../utils/response.js";

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  let errors = {};

  if (!email) errors.email = "Email wajib diisi";
  if (!password) errors.password = "Password wajib diisi";

  if (Object.keys(errors).length > 0) {
    return error(res, {
      message: "Validasi gagal",
      errors,
      code: 422,
    });
  }

  next();
};