import { Router } from "express";
import {
  getKuesioner,
  createKuesioner,
  updateKuesioner,
  deleteKuesioner,
  getKuesionerById,
  arsipKuesioner
} from "../controllers/kuesionerController.js";

import { authMiddleware } from "../middlewares/auth.js";

import {
  createKuesionerValidator,
  updateKuesionerValidator,
  deleteKuesionerValidator,
  getKuesionerByIdValidator,
  arsipKuesionerValidator
} from "../middlewares/validators/kuesionerValidator.js";

import indikatorRoute from "./indikatorRoute.js";
import distribusiRoute from "./distribusiRoute.js"

const router = Router();

// LIST
router.get("/", authMiddleware, getKuesioner);

// DETAIL
router.get("/:id",
  authMiddleware,
  getKuesionerByIdValidator,
  getKuesionerById
);

// CREATE
router.post("/",
  authMiddleware,
  createKuesionerValidator,
  createKuesioner
);

// UPDATE
router.patch("/:id",
  authMiddleware,
  updateKuesionerValidator,
  updateKuesioner
);

// DELETE
router.delete("/:id",
  authMiddleware,
  deleteKuesionerValidator,
  deleteKuesioner
);

router.patch(
  "/:id/arsip",
  authMiddleware,
  arsipKuesionerValidator,
  arsipKuesioner
);


// NESTED: INDIKATOR DALAM KUESIONER
router.use("/:kuesionerId/indikator", indikatorRoute);
router.use("/:kuesionerId/distribusi", distribusiRoute);


export default router;
