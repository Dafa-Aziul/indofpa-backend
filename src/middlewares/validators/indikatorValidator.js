import { body, param } from "express-validator";
import { validate } from "../validate.js";


// get indikator list
export const getIndikatorValidator = [
  param("variabelId")
    .notEmpty().withMessage("Variabel ID wajib diberikan")
    .isInt().withMessage("Variabel ID harus berupa angka")
    .toInt(),
  validate,
];


// create indikator
export const createIndikatorValidator = [
  param("variabelId")
    .notEmpty().withMessage("Variabel ID wajib diberikan")
    .isInt().withMessage("Variabel ID harus berupa angka")
    .toInt(),

  body("nama")
    .trim()
    .notEmpty().withMessage("Nama indikator wajib diisi"),

  body("kode")
    .trim()
    .notEmpty().withMessage("Kode indikator wajib diisi"),

  validate,
];


// update indikator
export const updateIndikatorValidator = [
  param("id")
    .notEmpty().withMessage("ID indikator wajib diberikan")
    .isInt().withMessage("ID indikator harus berupa angka")
    .toInt(),

  // body tidak boleh kosong
  body().custom((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Body harus berupa object JSON");
    }
    if (Object.keys(value).length === 0) {
      throw new Error("Tidak ada data yang dikirim");
    }
    return true;
  }),

  // field yang boleh diubah
  body().custom((value) => {
    const allowed = ["nama", "kode"];
    const keys = Object.keys(value);
    const invalid = keys.filter(k => !allowed.includes(k));

    if (invalid.length > 0) {
      throw new Error(`Field tidak valid: ${invalid.join(", ")}`);
    }

    return true;
  }),

  body("nama")
    .optional()
    .trim()
    .notEmpty().withMessage("Nama indikator tidak boleh kosong"),

  body("kode")
    .optional()
    .trim()
    .notEmpty().withMessage("Kode indikator tidak boleh kosong"),

  validate,
];


// delete indikator
export const deleteIndikatorValidator = [
  param("id")
    .notEmpty().withMessage("ID indikator wajib diberikan")
    .isInt().withMessage("ID indikator harus berupa angka")
    .toInt(),
  validate,
];
