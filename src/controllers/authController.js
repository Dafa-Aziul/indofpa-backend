import { success } from "../utils/response.js";
import { loginService, logoutService, rotateRefreshTokenService } from "../services/authService.js";
import { cookieConfig } from "../utils/cookieConfig.js";
import ApiError from "../utils/apiError.js";


export const login = async (req, res, next) => {
  try {
    const { email, password, remember } = req.body;


    const result = await loginService(email, password, remember);
    if (!result.success) throw new ApiError(result.code, result.message);


    const { accessToken, refreshToken, user } = result.data;


    res.cookie(
      "refresh_token",
      refreshToken,
      cookieConfig(remember ? 30 * 86400000 : 7 * 86400000)
    );


    return success(res, "Login berhasil", { user, accessToken });
  } catch (err) {
    next(err);
  }
};


export const refresh = async (req, res, next) => {
  try {
    const oldToken = req.cookies.refresh_token;
    if (!oldToken) throw new ApiError(401, "Refresh token tidak ditemukan");


    const result = await rotateRefreshTokenService(oldToken);
    if (!result.success) throw new ApiError(result.code, result.message);


    res.cookie(
      "refresh_token",
      result.newRefreshToken,
      cookieConfig(30 * 86400000)
    );


    return success(res, { accessToken: result.newAccessToken });
  } catch (err) {
    next(err);
  }
};


export const me = async (req, res, next) => {
  try {
    return success(res, "Data user berhasil didapatkan",
      req.user);
  } catch (err) {
    next(err);
  }
};


export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    console.log("COOKIE REFRESH DITERIMA LOGOUT =", req.cookies.refresh_token);
    if (!refreshToken) {
      throw new ApiError(400, "Refresh token tidak ditemukan");
    }

    // hapus dari database
    await logoutService(refreshToken);

    // hapus cookie — HARUS sama persis seperti cookieConfig
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true" ? true : false,
      sameSite: process.env.COOKIE_SAMESITE || (isDev ? "lax" : "none"),
      path: "/",
    });


    return success(res, "Logout berhasil");
  } catch (err) {
    next(err);
  }
};