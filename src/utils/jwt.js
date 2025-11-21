import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const JWT_EXPIRES = "7d"; // bisa kamu ubah

// Membuat token JWT
export const createToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
};

// Verifikasi token JWT
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null; // token invalid
  }
};

// Middleware untuk proteksi endpoint Admin
export const authAdmin = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan",
      });
    }

    const token = header.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid",
      });
    }

    // JWT valid → simpan data user ke req
    req.user = decoded;
    next();

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Autentikasi gagal"
    });
  }
};
