import { body, param } from "express-validator";
import { validate } from "../validate.js";

/* ============================================
   CREATE KUESIONER VALIDATION
   ============================================ */
export const createKuesionerValidator = [
  body("judul")
    .trim()
    .notEmpty().withMessage("Judul wajib diisi"),

  body("kategoriId")
    .notEmpty().withMessage("Kategori wajib dipilih")
    .isInt().withMessage("Kategori harus berupa angka")
    .toInt(),

  body("tujuan")
    .optional()
    .isString().withMessage("Tujuan harus berupa teks"),

  body("manfaat")
    .optional()
    .isString().withMessage("Manfaat harus berupa teks"),

  body("status")
    .optional()
    .isIn(["Draft", "Publish", "Arsip"])
    .withMessage("Status tidak valid"),

  validate,
];

/* ============================================
   UPDATE KUESIONER VALIDATION
   ============================================ */
export const updateKuesionerValidator = [
  body().custom((value) => {
    if (typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Body harus berupa object JSON");
    }
    if (Object.keys(value).length === 0) {
      throw new Error("Tidak ada data yang dikirim");
    }
    return true;
  }),

  body("judul")
    .optional()
    .trim()
    .notEmpty().withMessage("Judul tidak boleh kosong"),

  body("status")
    .optional()
    .isIn(["Draft", "Publish", "Arsip"])
    .withMessage("Status tidak valid"),

  body("kategoriId")
    .optional()
    .isInt().withMessage("Kategori harus berupa angka")
    .toInt(),

  validate,
];

/* ============================================
   DELETE KUESIONER VALIDATION
   ============================================ */
export const deleteKuesionerValidator = [
  param("id")
    .notEmpty().withMessage("ID wajib diberikan")
    .isInt().withMessage("ID harus berupa angka")
    .toInt(),

  validate,
];
