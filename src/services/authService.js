import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

// Convert "7d" / "1d" / "30d" → ms
const ms = (str) => {
  const num = parseInt(str);
  if (str.endsWith("d")) return num * 24 * 60 * 60 * 1000;
  if (str.endsWith("h")) return num * 60 * 60 * 1000;
  if (str.endsWith("m")) return num * 60 * 1000;
  return num;
};

export const loginService = async (email, password, remember = false) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { success: false, code: 401, message: "Email atau password salah" };

  const match = await bcrypt.compare(password, user.password);
  if (!match) return { success: false, code: 401, message: "Email atau password salah" };

  const accessExp  = remember ? "1h" : "15m";
  const refreshExp = remember ? "30d" : "7d";

  // ADD NAME → FIX !!!
  const accessToken = createAccessToken(
    { userId: user.userId, name: user.name, email: user.email },
    accessExp
  );

  const { token: refreshToken, jti } = createRefreshToken(
    { userId: user.userId },
    refreshExp
  );

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      jti,
      userId: user.userId,
      expiredAt: new Date(Date.now() + ms(refreshExp))
    }
  });

  return {
    success: true,
    code: 200,
    data: {
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        nama: user.nama,
        email: user.email,
      }
    }
  };
};



export const rotateRefreshTokenService = async (oldRefreshToken) => {
  const decoded = verifyRefreshToken(oldRefreshToken);
  if (!decoded)
    return { success: false, code: 401, message: "Refresh token invalid atau expired" };

  const userId = decoded.userId;

  // Cek token lama di database
  const stored = await prisma.refreshToken.findFirst({
    where: { token: oldRefreshToken }
  });

  if (!stored)
    return { success: false, code: 403, message: "Refresh token sudah dicabut" };

  // Hapus refresh lama
  await prisma.refreshToken.deleteMany({ where: { token: oldRefreshToken } });

  // 🔥 Ambil user dari database — FIX!!!
  const user = await prisma.user.findUnique({
    where: { userId },
    select: { userId: true, nama: true, email: true },
  });

  if (!user)
    return { success: false, code: 404, message: "User tidak ditemukan" };

  // 🔥 Access token baru lengkap — FIX!!!
  const newAccessToken = createAccessToken(
    {
      userId: user.userId,
      name: user.nama,
      email: user.email,
    },
    "15m"
  );

  // Refresh token baru
  const { token: newRefreshToken, jti } = createRefreshToken(
    { userId },
    "7d"
  );

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      jti,
      userId,
      expiredAt: new Date(Date.now() + ms("7d"))
    }
  });

  return {
    success: true,
    code: 200,
    newAccessToken,
    newRefreshToken
  };
};



export const logoutService = async (refreshToken) => {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  return { success: true, message: "Logout berhasil" };
};