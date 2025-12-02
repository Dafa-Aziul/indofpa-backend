import { param, body } from "express-validator";
import { validate } from "../validate.js";

export const getDistribusiValidator = [
  param("kuesionerId").isInt().withMessage("ID kuesioner tidak valid"),
  validate
];

export const createDistribusiValidator = [
  param("kuesionerId").isInt().withMessage("ID kuesioner tidak valid"),

  body("tanggalMulai").optional().isISO8601().withMessage("Tanggal mulai tidak valid"),
  body("tanggalSelesai").optional().isISO8601().withMessage("Tanggal selesai tidak valid"),
  body("catatan").optional().isString(),

  validate
];

export const updateDistribusiValidator = [
  param("id").isInt().withMessage("ID distribusi tidak valid"),

  body("tanggalMulai").optional().isISO8601(),
  body("tanggalSelesai").optional().isISO8601(),
  body("catatan").optional(),

  validate
];

export const deleteDistribusiValidator = [
  param("id").isInt().withMessage("ID distribusi tidak valid"),
  validate
];
