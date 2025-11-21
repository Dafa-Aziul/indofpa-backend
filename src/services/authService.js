import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { createToken } from "../utils/jwt.js";
import { logLogin, logLogout } from "./logService.js";


export const loginService = async (email, password, remember = false) => {

  // Cari user berdasarkan email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return { success: false, message: "Email tidak ditemukan" };
  }

  // Cek password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return { success: false, message: "Password salah" };
  }

  // Durasi token (remember me)
  const duration = remember ? "30d" : "1d";

  // Generate token via utils
  const token = createToken(
    { idUser: user.idUser, email: user.email },
    duration
  );

  // Simpan log login sukses
  await logLogin(user.idUser);

  // Response success
  return {
    success: true,
    message: "Login berhasil",
    data: {
      token,
      remember,
      expires_in: duration,
      user: {
        idUser: user.idUser,
        nama: user.nama,
        email: user.email
      }
    }
  };
};

export const logoutService = async (user, token) => {
  // Simpan token ke table revoked token
  await prisma.revokedToken.create({
    data: {
      token,
      expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 hari
    }
  });

  await logLogout(user.idUser);

  return {
    success: true,
    message: "Logout berhasil. Token sudah dinonaktifkan."
  };
};
