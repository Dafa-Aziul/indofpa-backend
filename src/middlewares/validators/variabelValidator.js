import { body, param } from "express-validator";
import { validate } from "../validate.js";

// get variabel list
export const getVariabelValidator = [
  param("kuesionerId")
    .notEmpty().withMessage("kuesionerId wajib diisi")
    .isInt().withMessage("kuesionerId harus angka")
    .toInt(),
  validate,
];

// create variabel
export const createVariabelValidator = [
  param("kuesionerId")
    .notEmpty().withMessage("kuesionerId wajib diisi")
    .isInt().withMessage("kuesionerId harus angka")
    .toInt(),

  body("kode")
    .trim()
    .notEmpty().withMessage("Kode wajib diisi"),

  body("nama")
    .trim()
    .notEmpty().withMessage("Nama wajib diisi"),

  body("deskripsi")
    .optional()
    .isString().withMessage("Deskripsi harus teks"),

  validate,
];

// update variabel
export const updateVariabelValidator = [
  param("id")
    .notEmpty().withMessage("ID wajib diisi")
    .isInt().withMessage("ID harus angka")
    .toInt(),

  body().custom((value) => {
    if (!value || typeof value !== "object") throw new Error("Body harus object");
    if (Object.keys(value).length === 0) throw new Error("Tidak ada data");
    return true;
  }),

  body("kode")
    .optional()
    .trim()
    .notEmpty().withMessage("Kode tidak boleh kosong"),

  body("nama")
    .optional()
    .trim()
    .notEmpty().withMessage("Nama tidak boleh kosong"),

  body("deskripsi")
    .optional()
    .isString().withMessage("Deskripsi harus teks"),

  validate,
];

// delete variabel
export const deleteVariabelValidator = [
  param("id")
    .notEmpty().withMessage("ID wajib diisi")
    .isInt().withMessage("ID harus angka")
    .toInt(),
  validate,
];
