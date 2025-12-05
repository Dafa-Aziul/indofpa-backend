import { body, param } from "express-validator";
import { validate } from "../validate.js";

// create kuesioner validation
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
    .trim()
    .isString().withMessage("Tujuan harus berupa teks"),

  body("manfaat")
    .optional()
    .trim()
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


// update kuesioner validation
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
    .trim()
    .isString().withMessage("Tujuan harus berupa teks"),

  body("manfaat")
    .optional()
    .trim()
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


// delete kuesioner validation
export const deleteKuesionerValidator = [
  param("id")
    .notEmpty().withMessage("ID wajib diberikan")
    .isInt().withMessage("ID harus berupa angka")
    .toInt(),

  validate,
];

// get detail kuesioner validation
export const getKuesionerByIdValidator = [
  param("id")
    .notEmpty().withMessage("ID wajib diberikan")
    .isInt().withMessage("ID harus berupa angka")
    .toInt(),

  validate,
];

// arsip kuesioner validation
export const arsipKuesionerValidator = [
  param("id")
    .notEmpty().withMessage("ID wajib diberikan")
    .isInt().withMessage("ID harus berupa angka")
    .toInt(),

  validate,
];
