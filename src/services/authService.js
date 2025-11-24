import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

export const loginService = async (email, password, remember = false) => {
  // 1. Cari user
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return {
      success: false,
      code: 401,
      message: "Email atau password salah"
    };
  }

  // 2. Cek password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return {
      success: false,
      code: 401,
      message: "Email atau password salah"
    };
  }

  // 3. Masa berlaku token
  const accessExp = remember ? "7d" : "1d";
  const refreshExp = remember ? "30d" : "7d";

  // 4. Access token
  const accessToken = createAccessToken(
    { userId: user.userId, email: user.email },
    accessExp
  );

  // 5. Refresh token
  const refreshToken = createRefreshToken(
    { userId: user.userId },
    refreshExp
  );

  // 6. Simpan refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.userId,
      expiredAt: new Date(Date.now() + ms(refreshExp))
    }
  });

  // 7. Return ke controller
  return {
    success: true,
    code: 200,
    message: "Login berhasil",
    data: {
      accessToken,
      refreshToken,
      accessExp,
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


export const rotateRefreshTokenService = async (oldRefreshToken) => {

  // 1. Verifikasi JWT refresh token
  const decoded = verifyRefreshToken(oldRefreshToken);
  if (!decoded) {
    return {
      success: false,
      code: 401,
      message: "Refresh token invalid atau expired"
    };
  }

  const userId = decoded.userId;

  // 2. Cek apakah refresh token ada di database (valid)
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken }
  });

  if (!storedToken) {
    return {
      success: false,
      code: 403,
      message: "Refresh token sudah dicabut"
    };
  }

  // 3. Hapus refresh token lama
  await prisma.refreshToken.delete({
    where: { token: oldRefreshToken }
  });

  // 4. Buat access token baru
  const newAccessToken = createAccessToken({ userId }, "1d");

  // 5. Buat refresh token baru
  const newRefreshToken = createRefreshToken({ userId }, "30d");

  // 6. Simpan refresh token baru
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId,
      expiredAt: new Date(Date.now() + 30 * 86400000)
    }
  });

  return {
    success: true,
    code: 200,
    newAccessToken,
    newRefreshToken
  };
};

// Utility converter "7d" / "30d" / "1d"
const ms = (str) => {
  const num = parseInt(str);
  if (str.endsWith("d")) return num * 24 * 60 * 60 * 1000;
  if (str.endsWith("h")) return num * 60 * 60 * 1000;
  if (str.endsWith("m")) return num * 60 * 1000;
  if (str.endsWith("s")) return num * 1000;
  return num;
};
