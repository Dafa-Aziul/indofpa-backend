import { loginService, logoutService } from "../services/authService.js";
import { success, error } from "../utils/response.js";
import { verifyRefreshToken, createAccessToken } from "../utils/jwt.js";
import { logLogin, logLogout } from "../services/logService.js";

export const login = async (req, res) => {
  try {
    const { email, password, remember } = req.body;
    const result = await loginService(email, password, remember);

    if (!result.success) {
      return error(res, { message: result.message, code: 400 });
    }

    const { accessToken, refreshToken, user } = result.data;

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      req.ip;

    const userAgent = req.headers["user-agent"] || "Unknown";

    await logLogin(user.userId, ip, userAgent);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: remember ? 7 * 86400000 : 86400000,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: remember ? 30 * 86400000 : 7 * 86400000,
    });

    return success(res, { message: "Login berhasil", data: user });

  } catch (err) {
    return error(res, {
      message: "Terjadi kesalahan saat login",
      errors: err.message,
      code: 500,
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) {
      return error(res, { message: "Refresh token tidak ditemukan", code: 401 });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return error(res, { message: "Refresh token invalid", code: 401 });
    }

    const newAccess = createAccessToken(
      { userId: decoded.userId },
      "1d"
    );

    res.cookie("access_token", newAccess, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 86400000,
    });

    return success(res, { message: "Token diperbarui" });

  } catch (err) {
    return error(res, {
      message: "Gagal memperbarui token",
      errors: err.message,
      code: 500,
    });
  }
};

export const me = async (req, res) => {
  try {
    return success(res, {
      message: "Data user berhasil didapatkan",
      data: req.user,
      code: 200,
    });
  } catch (err) {
    return error(res, {
      message: "Gagal mengambil data user",
      errors: err.message,
      code: 500,
    });
  }
};

export const logout = async (req, res) => {
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
      secure: false,
      sameSite: "lax",
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return success(res, { message: result.message });

  } catch (err) {
    return error(res, {
      message: "Logout gagal",
      errors: err.message,
      code: 500,
    });
  }
};
