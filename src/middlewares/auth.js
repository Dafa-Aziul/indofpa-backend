import ApiError from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/jwt.js";


export const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization;


    if (!header || !header.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized: Token tidak ditemukan");
    }


    const token = header.split(" ")[1];
    const decoded = verifyAccessToken(token);


    if (!decoded) {
      throw new ApiError(401, "Token tidak valid atau sudah kedaluwarsa");
    }


    req.user = {
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
    };


    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, "Autentikasi gagal");
  }
};