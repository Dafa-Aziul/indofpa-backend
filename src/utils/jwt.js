import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ISSUER = process.env.JWT_ISSUER || "your-app";

export const createAccessToken = (payload, expiresIn = "15m") => {
  return jwt.sign(
    { ...payload },
    ACCESS_SECRET,
    { expiresIn, issuer: ISSUER }
  );
};

export const createRefreshToken = (payload, expiresIn = "7d") => {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { ...payload, jti },
    REFRESH_SECRET,
    { expiresIn, issuer: ISSUER }
  );
  return { token, jti };
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

