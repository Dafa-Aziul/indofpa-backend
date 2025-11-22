import { verifyAccessToken } from "../utils/jwt.js";
import { error } from "../utils/response.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.access_token;

  // Tidak ada access token
  if (!token) {
    return error(res, {
      message: "Unauthorized",
      errors: "Access token missing",
      code: 401,
    });
  }

  // Verifikasi access token
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return error(res, {
      message: "Token tidak valid atau kedaluwarsa",
      code: 401,
    });
  }

  // Inject user ke req
  req.user = decoded;
  req.token = token;

  next();
};
