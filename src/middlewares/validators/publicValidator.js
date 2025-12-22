import { body, param } from "express-validator";
import { validate } from "../validate.js";

export const getPublicKuesionerValidator = [
  param("kodeAkses").notEmpty().withMessage("Kode akses wajib diisi"),
  validate
];

export const submitKuesionerValidator = [
  param("kodeAkses").notEmpty().withMessage("Kode akses wajib diisi"),

  // profile
  body("profile").notEmpty().isObject(),

  body("profile.nama").optional().isString(),
  body("profile.email").optional().isEmail().withMessage("Email tidak valid"),
  body("profile.usiaKategori").notEmpty(),
  body("profile.jenisKelamin").notEmpty().isIn(["L", "P"]),
  body("profile.tingkatPendidikan").notEmpty(),
  body("profile.agama").notEmpty(),
  body("profile.pekerjaan").optional().isString(),

  // jawaban
  body("jawaban")
    .isArray({ min: 1 })
    .withMessage("Jawaban harus berupa array"),

  body("jawaban.*.pertanyaanId")
    .isInt()
    .withMessage("pertanyaanId harus berupa angka"),

  body("jawaban.*.nilai")
    .isInt({ min: 1, max: 10 })
    .withMessage("nilai harus angka 1-10"),

  // Cek duplikat pertanyaan id
  body("jawaban").custom((arr) => {
    const ids = arr.map((j) => j.pertanyaanId);
    if (new Set(ids).size !== ids.length) {
      throw new Error("Tidak boleh ada pertanyaan yang dijawab dua kali");
    }
    return true;
  }),

  validate,
];
