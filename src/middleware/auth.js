import prisma from "../config/prisma.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token tidak ditemukan" });
  }

  const token = header.split(" ")[1];

  // Simpan token agar diketahui controller
  req.token = token;

  // ❗ Check apakah token sudah di-blacklist
  const revoked = await prisma.revokedToken.findUnique({
    where: { token }
  });

  if (revoked) {
    return res.status(401).json({ success: false, message: "Token sudah tidak berlaku (logout)" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau kedaluwarsa",
    });
  }
};
