import { body, param } from "express-validator";
import { validate } from "../validate.js";

export const createPertanyaanValidator = [
    body("teksPertanyaan").trim().notEmpty().withMessage("teks pertanyaan wajib diisi"),
    body("urutan").trim().notEmpty().withMessage("Urutan wajib diisi").isInt("Urutan harus berupa angka").toInt(),

    validate,
];


const allowedFieldsPertanyaan = ["teksPertanyaan", "urutan", "indikatorId"];

export const updatePertanyaanValidator = [

  body().custom((value) => {
    if (typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Body harus berupa object JSON");
    }
    if (Object.keys(value).length === 0) {
      throw new Error("Tidak ada data yang dikirim");
    }

    // Anti manipulasi: hanya field tertentu yang boleh
    const invalidFields = Object.keys(value).filter(
      (key) => !allowedFieldsPertanyaan.includes(key)
    );

    if (invalidFields.length > 0) {
      throw new Error(`Field tidak diizinkan: ${invalidFields.join(", ")}`);
    }

    return true;
  }),

  body("teksPertanyaan")
    .optional()
    .trim()
    .notEmpty().withMessage("teksPertanyaan tidak boleh kosong"),

  body("urutan")
    .optional()
    .notEmpty().withMessage("Urutan tidak boleh kosong")
    .isInt().withMessage("Urutan harus berupa angka")
    .toInt(),

  validate,
];



export const deletePertanyaanValidator = [
    param("id")
        .notEmpty().withMessage("ID wajib diberikan")
        .isInt("ID harus berupa angka")
        .toInt(),

    validate,
];