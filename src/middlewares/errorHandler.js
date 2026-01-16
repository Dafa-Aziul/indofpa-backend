import { Prisma } from "@prisma/client";
import multer from "multer";
import ApiError from "../utils/apiError.js";

const isDev = process.env.NODE_ENV !== "production";

export const errorHandler = (err, req, res, next) => {
  // LOGGING
  if (isDev) {
    console.error("🔥 DEV ERROR:", err);
  } else {
    console.error("🔥 PROD ERROR:", err.message);
  }

  // JSON PARSE ERROR
  if (err instanceof SyntaxError && err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Format JSON tidak valid",
      errors: isDev ? err.body : null,
    });
  }

  // JWT ERRORS
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

  // MULTER ERRORS
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: "Kesalahan upload file",
      errors: isDev ? err.message : null,
    });
  }

  // CUSTOM API ERROR (PRIORITAS SEBELUM PRISMA)
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
    });
  }

  // PRISMA KNOWN ERRORS
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaDetail = {
      code: err.code,
      message: err.message,
      meta: err.meta || null,
    };

    switch (err.code) {
      case "P2025": // Data not found
        return res.status(404).json({
          success: false,
          message: "Data tidak ditemukan",
          errors: isDev ? prismaDetail : null,
        });

      case "P2002": // Unique constraint failed
        return res.status(409).json({
          success: false,
          message: "Data duplikat — field harus unik",
          errors: isDev ? prismaDetail : null,
        });

      case "P2003": {
        const detail = err.meta?.field_name || "";

        // REGEX FK lebih aman
        const match = detail.match(/([^_]+)_([^_]+)_fkey/i);
        const table = match?.[1] || null;
        const column = match?.[2] || null;

        return res.status(400).json({
          success: false,
          message: "Relasi gagal — data referensi tidak ditemukan",
          errors: isDev
            ? {
                ...prismaDetail,
                table,
                column,
                explanation: `Foreign key '${column}' pada tabel '${table}' tidak memiliki referensi yang cocok.`,
              }
            : null,
        });
      }

      default:
        return res.status(400).json({
          success: false,
          message: "Kesalahan pada database",
          errors: isDev ? prismaDetail : null,
        });
    }
  }

  // PRISMA VALIDATION ERROR (query invalid)
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(422).json({
      success: false,
      message: "Validasi Prisma tidak valid",
      errors: isDev ? err.message : null,
    });
  }
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
    errors: isDev ? { message: err.message, stack: err.stack } : null,
  });
};
