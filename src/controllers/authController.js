import { success } from "../utils/response.js";
import { loginService, logoutService } from "../services/authService.js";
import { verifyRefreshToken, createAccessToken } from "../utils/jwt.js";
import { logLogin, logLogout } from "../services/logService.js";

const isDev = process.env.NODE_ENV !== "production";

const cookieConfig = (maxAge) => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: process.env.COOKIE_SAMESITE || (isDev ? "lax" : "none"),
  maxAge,
});

export const login = async (req, res, next) => {
  try {
    const { email, password, remember } = req.body;

    const result = await loginService(email, password, remember);

    if (!result.success) {
      // lempar custom error ke errorHandler
      const ApiError = (await import("../utils/apiError.js")).default;
      throw new ApiError(result.code || 400, result.message);
    }

    const { accessToken, refreshToken, user } = result.data;

    // Logging
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      req.ip;

    const userAgent = req.headers["user-agent"] || "Unknown";

    await logLogin(user.userId, ip, userAgent);


    // Set cookies
    res.cookie("access_token", accessToken, cookieConfig(remember ? 7 * 86400000 : 86400000));
    res.cookie("refresh_token", refreshToken, cookieConfig(remember ? 30 * 86400000 : 7 * 86400000));

    return success(res, {
      message: "Login berhasil",
      data: user,
    });

  } catch (err) {
    next(err); // semua error masuk errorHandler
  }
};


export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refresh_token;

    if (!token) {
      const ApiError = (await import("../utils/apiError.js")).default;
      throw new ApiError(401, "Refresh token tidak ditemukan");
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      const ApiError = (await import("../utils/apiError.js")).default;
      throw new ApiError(401, "Refresh token invalid");
    }

    const newAccess = createAccessToken({ userId: decoded.userId }, "1d");

    res.cookie("access_token", newAccess, cookieConfig(86400000));

    return success(res, { message: "Token diperbarui" });

  } catch (err) {
    next(err);
  }
};


export const me = async (req, res, next) => {
  try {
    return success(res, {
      message: "Data user berhasil didapatkan",
      data: req.user,
    });
  } catch (err) {
    next(err);
  }
};


export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      req.ip;

    const userAgent = req.headers["user-agent"] || "Unknown";

    const result = await logoutService(req.user, refreshToken);
    await logLogout(req.user.userId, ip, userAgent);

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAMESITE || (isDev ? "lax" : "none"),
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAMESITE || (isDev ? "lax" : "none"),
    });

    return success(res, { message: result.message });

  } catch (err) {
    next(err);
  }
};
