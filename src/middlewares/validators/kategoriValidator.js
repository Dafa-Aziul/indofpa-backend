import { body, param } from "express-validator";
import { validate } from "../validate.js";

export const createKategoriValidator = [
  body("nama")
    .notEmpty().withMessage("Nama kategori wajib diisi")
    .isString().withMessage("Nama kategori harus berupa teks"),
  validate
];

export const updateKategoriValidator = [
  param("id").isInt().withMessage("ID tidak valid"),

  body("nama")
    .optional()
    .notEmpty().withMessage("Nama tidak boleh kosong")
    .isString().withMessage("Nama kategori harus berupa teks"),
  validate
];

export const deleteKategoriValidator = [
  param("id").isInt().withMessage("ID tidak valid"),
  validate
];
