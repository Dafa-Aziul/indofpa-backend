import { body, param } from "express-validator";
import { validate } from "../validate.js";


/* ============================================
   GET PERTANYAAN PER INDIKATOR
   ============================================ */
export const getPertanyaanValidator = [
  param("indikatorId")
    .notEmpty().withMessage("ID indikator wajib diberikan")
    .isInt().withMessage("ID indikator harus berupa angka")
    .toInt(),

  validate,
];


/* ============================================
   CREATE PERTANYAAN
   ============================================ */
export const createPertanyaanValidator = [
  param("indikatorId")
    .notEmpty().withMessage("ID indikator wajib diberikan")
    .isInt().withMessage("ID indikator harus berupa angka")
    .toInt(),

  body("teksPertanyaan")
    .trim()
    .notEmpty().withMessage("Teks pertanyaan wajib diisi"),

  body("urutan")
    .notEmpty().withMessage("Urutan wajib diisi")
    .isInt({ min: 1 }).withMessage("Urutan harus berupa angka dan minimal 1")
    .toInt(),

  validate,
];


/* ============================================
   UPDATE PERTANYAAN (PATCH)
   ============================================ */
export const updatePertanyaanValidator = [
  param("id")
    .notEmpty().withMessage("ID pertanyaan wajib diberikan")
    .isInt().withMessage("ID pertanyaan harus berupa angka")
    .toInt(),

  // Body tidak boleh kosong
  body().custom((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Body harus berupa object JSON");
    }
    if (Object.keys(value).length === 0) {
      throw new Error("Tidak ada data yang dikirim");
    }
    return true;
  }),

  body("teksPertanyaan")
    .optional()
    .trim()
    .notEmpty().withMessage("Teks pertanyaan tidak boleh kosong"),

  body("urutan")
    .optional()
    .isInt({ min: 1 }).withMessage("Urutan harus berupa angka minimal 1")
    .toInt(),

  validate,
];


/* ============================================
   DELETE PERTANYAAN
   ============================================ */
export const deletePertanyaanValidator = [
  param("id")
    .notEmpty().withMessage("ID pertanyaan wajib diberikan")
    .isInt().withMessage("ID pertanyaan harus berupa angka")
    .toInt(),

  validate,
];
