import { Router } from "express";

import {
  getIndikator,
  createIndikator,
  updateIndikator,
  deleteIndikator
} from "../controllers/indikatorController.js";

import { authMiddleware } from "../middlewares/auth.js";

import {
  getIndikatorValidator,
  createIndikatorValidator,
  updateIndikatorValidator,
  deleteIndikatorValidator
} from "../middlewares/validators/indikatorValidator.js";

import pertanyaanRoute from "./pertanyaanRoute.js";

const router = Router({mergeParams: true});


// LIST indikator dalam kuesioner
router.get(
  "/",
  authMiddleware,
  getIndikatorValidator,
  getIndikator
);

// CREATE indikator dalam kuesioner
router.post(
  "/",
  authMiddleware,
  createIndikatorValidator,
  createIndikator
);

// UPDATE indicator
router.patch(
  "/:id",
  authMiddleware,
  updateIndikatorValidator,
  updateIndikator
);

// DELETE indicator
router.delete(
  "/:id",
  authMiddleware,
  deleteIndikatorValidator,
  deleteIndikator
);

// NESTED: pertanyaan dalam indikator
router.use("/:indikatorId/pertanyaan", pertanyaanRoute);

export default router;
