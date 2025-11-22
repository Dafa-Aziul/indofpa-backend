import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const createAccessToken = (payload, expiresIn = "15m") => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn });
};

export const createRefreshToken = (payload, expiresIn = "30d") => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    return null;
  }
}

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    return null;
  }
}
