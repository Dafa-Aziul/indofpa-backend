import { body, param } from "express-validator";
import { validate } from "../validate.js";


export const createIndikatorValidator = [
    body("nama").trim().notEmpty().withMessage("Nama indikator wajib diisi"),
    body("kode").trim().notEmpty().withMessage("Kode indikator wajib diisi"),

    validate,
];

export const updateIndikatorValidator = [
    body("nama")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Nama indikator tidak boleh kosong"),

    body("kode")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Kode indikator tidak boleh kosong"),

    validate,
];


export const deleteIndikatorValidator = [
    param("id")
        .notEmpty().withMessage("ID wajib diberikan")
        .isInt("ID harus berupa angka")
        .toInt(),

    validate,
];
