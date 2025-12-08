// src/utils/rateLimit.js
import rateLimit from "express-rate-limit";

export const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 10 * 60 * 1000, // default: 10 menit
    max: options.max || 5,                         // default: max 5 request
    message: options.message || "Terlalu banyak percobaan. Coba lagi nanti.",
    standardHeaders: true,
    legacyHeaders: false,
  });
};
