import { param, body } from "express-validator";
import { validate } from "../validate.js";

// VALIDATOR : GET LIST KUESIONER UNTUK ANALISIS
export const getAnalisisKuesionerListValidator = [
  validate
];


// VALIDATOR : GET ANALISIS KUESIONER
export const getAnalisisValidator = [
  param("kuesionerId")
    .notEmpty().withMessage("kuesionerId wajib diisi")
    .isInt({ min: 1 }).withMessage("kuesionerId harus angka valid")
    .toInt(),
  validate
];



// VALIDATOR : UPDATE ANALISIS CONFIG
export const updateAnalisisConfigValidator = [

  param("kuesionerId")
    .notEmpty().withMessage("kuesionerId wajib diisi")
    .isInt().withMessage("kuesionerId harus angka")
    .toInt(),

  body("interpretasi")
    .isArray().withMessage("interpretasi harus berupa array")
    .notEmpty().withMessage("interpretasi tidak boleh kosong"),

  body("interpretasi.*.min")
    .isNumeric().withMessage("min harus angka"),

  body("interpretasi.*.max")
    .isNumeric().withMessage("max harus angka"),

  body("interpretasi.*.label")
    .isString().withMessage("label harus berupa teks"),

  validate
];