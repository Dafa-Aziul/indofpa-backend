// src/middleware/auth.js
import ApiError from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = (req, _res, next) => {
  try {
    // Ambil token dari cookie
    const cookieToken = req.cookies?.access_token;

    // Ambil token dari Bearer header
    const bearerHeader = req.headers.authorization;
    const bearerToken =
      bearerHeader && bearerHeader.startsWith("Bearer ")
        ? bearerHeader.split(" ")[1]
        : null;

    // Tentukan token yang digunakan
    const token = cookieToken || bearerToken;

    if (!token) {
      throw new ApiError(401, "Unauthorized", {
        token: "Access token tidak ditemukan",
      });
    }

    // Verifikasi JWT Access Token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw new ApiError(401, "Token tidak valid atau sudah kedaluwarsa");
    }

    // Simpan info user ke request
    req.user = decoded;

    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, "Autentikasi gagal", err.message);
  }
};
