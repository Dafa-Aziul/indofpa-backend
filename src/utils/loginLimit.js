import rateLimit from "express-rate-limit";

export const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 10 * 60 * 1000,
    max: options.max || 5,
    message: options.message || "Terlalu banyak percobaan. Coba lagi nanti.",
    standardHeaders: true,
    legacyHeaders: false,
  });
};
