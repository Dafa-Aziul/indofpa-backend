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

  body("estimasiMenit")
    .optional()
    .isInt({ min: 1 }).withMessage("Estimasi menit minimal 1")
    .toInt(),

  body("targetResponden")
    .optional()
    .isInt({ min: 1 }).withMessage("Target responden harus angka minimal 1")
    .toInt(),

  // status tidak divalidasi → biarkan service set default Draft

  validate,
];


/* ============================================
   UPDATE KUESIONER VALIDATION (PATCH)
   ============================================ */
export const updateKuesionerValidator = [
  body().custom((value) => {
    if (!value || typeof value !== "object") {
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

  body("kategoriId")
    .optional()
    .isInt().withMessage("Kategori harus berupa angka")
    .toInt(),

  body("tujuan")
    .optional()
    .isString().withMessage("Tujuan harus berupa teks"),

  body("manfaat")
    .optional()
    .isString().withMessage("Manfaat harus berupa teks"),

  body("estimasiMenit")
    .optional()
    .isInt({ min: 1 }).withMessage("Estimasi menit minimal 1")
    .toInt(),

  body("targetResponden")
    .optional()
    .isInt({ min: 1 }).withMessage("Target responden harus angka minimal 1")
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

export const getKuesionerByIdValidator = [
  param("id")
    .notEmpty().withMessage("ID wajib diberikan")
    .isInt().withMessage("ID harus berupa angka")
    .toInt(),

  validate,
];

export const arsipKuesionerValidator = [
  param("id")
    .isInt().withMessage("ID tidak valid")
    .toInt(),
  validate,
];
