import crypto from "crypto";

/**
 * Generate random kode akses
 * @param {number} length 
 * @returns {string}
 */
export const generateAccessCode = (length = 8) => {
  return crypto.randomBytes(length / 2).toString("hex");
};

/**
 * Generate public link untuk kuesioner
 * @param {string} kodeAkses 
 * @returns {string}
 */
export const generatePublicLink = (kodeAkses) => {
  return `${process.env.APP_PUBLIC_URL}/kuesioner/${kodeAkses}`;
};
