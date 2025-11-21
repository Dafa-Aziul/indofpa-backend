import { success, error } from "../utils/response.js";
import { loginService, logoutService } from "../services/authService.js";

export const login = async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    const result = await loginService(email, password, remember);

    if (!result || !result.success) {
      return error(res, {
        message: result?.message || "Login gagal",
        errors: result?.errors || null,
        code: 400,
      });
    }

    return success(res, {
      message: "Login berhasil",
      data: result.data,   // hanya yang dibutuhkan
      code: 200,
    });

  } catch (err) {
    return error(res, {
      message: "Terjadi kesalahan saat login",
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
    const token = req.token; // dari middleware

    const result = await logoutService(req.user, token);

    if (!result?.success) {
      return error(res, {
        message: result?.message || "Logout gagal",
        code: 400,
      });
    }

    return success(res, {
      message: result.message,
      code: 200,
    });

  } catch (err) {
    return error(res, {
      message: "Logout gagal",
      errors: err.message,
      code: 500,
    });
  }
};
