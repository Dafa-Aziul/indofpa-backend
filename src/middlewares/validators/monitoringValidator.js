import { param, query } from "express-validator";
import { validate } from "../validate.js";

// Dashboard monitoring
export const monitoringListValidator = [
  query("status").optional().isString(),
  query("kategori").optional().isString(),
  validate,
];

// List responden
export const respondenListValidator = [
  param("kuesionerId").isInt().withMessage("ID kuesioner tidak valid").toInt(),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1 }).toInt(),
  query("search").optional().isString(),
  validate,
];

// Detail responden
export const respondenDetailValidator = [
  param("kuesionerId").isInt().withMessage("ID kuesioner tidak valid").toInt(),
  param("id").isInt().withMessage("ID responden tidak valid").toInt(),
  validate,
];
