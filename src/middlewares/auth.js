import ApiError from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "TOKEN_NOT_FOUND"));
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
    };

    next();
  } catch (err) {
    // Jika token EXP
    if (err.name === "TokenExpiredError") {
      return next(new ApiError(401, "TOKEN_EXPIRED"));
    }

    // Jika token INVALID
    if (err.name === "JsonWebTokenError") {
      return next(new ApiError(401, "TOKEN_INVALID"));
    }

    // Error lain
    return next(new ApiError(401, "AUTH_FAILED"));
  }
};
