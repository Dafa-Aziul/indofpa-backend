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

  const accessExp = remember ? "1h" : "15m";
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
        name: user.name,
        email: user.email,
      }
    }
  };
};



// services/auth.service.js
export const rotateRefreshTokenService = async (oldRefreshToken) => {
  // 1. Verify refresh token JWT
  const decoded = verifyRefreshToken(oldRefreshToken);
  if (!decoded) {
    return {
      success: false,
      code: 401,
      message: "Refresh token invalid atau expired",
    };
  }

  const userId = decoded.userId;

  // 2. Pastikan refresh token masih tersimpan di DB
  const stored = await prisma.refreshToken.findFirst({
    where: { token: oldRefreshToken },
  });

  if (!stored) {
    return {
      success: false,
      code: 403,
      message: "Refresh token sudah dicabut",
    };
  }

  // 3. Ambil data user (INI YANG PENTING)
  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    return {
      success: false,
      code: 404,
      message: "User tidak ditemukan",
    };
  }

  // 4. Buat token baru
  const newAccessToken = createAccessToken(
    {
      userId: user.userId,
      email: user.email,
    },
    "15m"
  );

  const { token: newRefreshToken, jti } = createRefreshToken(
    { userId: user.userId },
    "7d"
  );

  // 5. Simpan refresh token baru
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      jti,
      userId: user.userId,
      expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // 6. Hapus refresh token lama (ROTATION)
  await prisma.refreshToken.deleteMany({
    where: { token: oldRefreshToken },
  });

  // 7. Return LENGKAP
  return {
    success: true,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user, // ⬅️ INI WAJIB
  };
};




export const logoutService = async (refreshToken) => {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  return { success: true, message: "Logout berhasil" };
};