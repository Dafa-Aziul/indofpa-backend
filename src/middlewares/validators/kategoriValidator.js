import { body, param } from "express-validator";
import { validate } from "../validate.js";

// CREATE
export const createKategoriValidator = [
  body("nama")
    .notEmpty().withMessage("Nama kategori wajib diisi")
    .isString().withMessage("Nama kategori harus berupa teks")
    .trim()
    .isLength({ min: 3 }).withMessage("Nama kategori minimal 3 karakter"),
  validate
];

// UPDATE
export const updateKategoriValidator = [
  param("id")
    .isInt().withMessage("ID tidak valid"),

  body("nama")
    .optional() 
    .notEmpty().withMessage("Nama kategori tidak boleh kosong")
    .isString().withMessage("Nama kategori harus berupa teks")
    .trim()
    .isLength({ min: 3 }).withMessage("Nama kategori minimal 3 karakter"),
  
  validate
];

// DELETE
export const deleteKategoriValidator = [
  param("id")
    .isInt().withMessage("ID tidak valid"),
  validate
];
