import { Prisma } from "@prisma/client";
import multer from "multer";
import ApiError from "../utils/apiError.js";

const isDev = process.env.NODE_ENV !== "production";

export const errorHandler = (err, req, res, next) => {
  // ============================
  // LOGGING
  // ============================
  if (isDev) {
    console.error("🔥 DEV ERROR:", err);
  } else {
    console.error("🔥 PROD ERROR:", err.message);
  }

  // ============================
  // JSON PARSE ERROR
  // ============================
  if (err instanceof SyntaxError && err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Format JSON tidak valid",
      errors: isDev ? err.body : null
    });
  }


  // ============================
  // JWT ERROR
  // ============================
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid",
      errors: isDev ? err.message : null,
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token sudah kedaluwarsa",
      errors: isDev ? { expiredAt: err.expiredAt } : null,
    });
  }

  // ============================
  // MULTER (UPLOAD)
  // ============================
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: "Kesalahan upload file",
      errors: isDev ? err.message : null,
    });
  }

  // ============================
  // PRISMA CLIENT KNOWN ERRORS
  // ============================
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2025": // Not found
        return res.status(404).json({
          success: false,
          message: "Data tidak ditemukan",
          errors: isDev ? err.meta : null,
        });

      case "P2002": // Unique constraint
        return res.status(409).json({
          success: false,
          message: "Data duplikat — field harus unik",
          errors: isDev ? err.meta?.target : null,
        });

      case "P2003": // Foreign key fail
        return res.status(400).json({
          success: false,
          message: "Relasi gagal — data referensi tidak ditemukan",
          errors: isDev ? err.meta?.field_name : null,
        });

      default:
        return res.status(400).json({
          success: false,
          message: "Kesalahan pada database",
          errors: isDev ? err.message : null,
        });
    }
  }

  // ============================
  // PRISMA VALIDATION
  // ============================
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(422).json({
      success: false,
      message: "Validasi Prisma tidak valid",
      errors: isDev ? err.message : null,
    });
  }

  // ============================
  // CUSTOM API ERROR
  // ============================
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
    });
  }


  // ============================
  // UNKNOWN SERVER ERROR
  // ============================
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
    errors: isDev ? { message: err.message, stack: err.stack } : null,
  });
};
