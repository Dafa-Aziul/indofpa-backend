import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken } from "../utils/jwt.js";
import { logLogin, logLogout } from "./logService.js";

export const loginService = async (email, password, remember = false) => {

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return { success: false, message: "Email tidak ditemukan" };

  const match = await bcrypt.compare(password, user.password);
  if (!match) return { success: false, message: "Password salah" };

  const accessExp = remember ? "7d" : "1d";
  const refreshExp = remember ? "30d" : "7d";
  

  const accessToken = createAccessToken(
    { userId: user.userId, email: user.email },
    accessExp
  );

  const refreshToken = createRefreshToken(
    { userId: user.userId },
    refreshExp
  );

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.userId,
      expiredAt: new Date(Date.now() + toMs(refreshExp))
    }
  });

  return {
    success: true,
    message: "Login berhasil",
    data: {
      accessToken,
      refreshToken,
      expires_in: accessExp,
      user: {
        userId: user.userId,
        nama: user.nama,
        email: user.email
      }
    }
  };
};


export const logoutService = async (user, refreshToken) => {

  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken }
  });

  return {
    success: true,
    message: "Logout berhasil. Refresh token dicabut."
  };
};

// Utility converter "7d" / "30d" / "1d"
function toMs(str) {
  const num = parseInt(str);
  if (str.endsWith("d")) return num * 24 * 60 * 60 * 1000;
  if (str.endsWith("h")) return num * 60 * 60 * 1000;
  if (str.endsWith("m")) return num * 60 * 1000;
  return num;
}
