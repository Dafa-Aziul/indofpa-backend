import { Router } from "express";

import {
  getPertanyaan,
  createPertanyaan,
  updatePertanyaan,
  deletePertanyaan
} from "../controllers/pertanyaanController.js";

import { authMiddleware } from "../middlewares/auth.js";

import {
  getPertanyaanValidator,
  createPertanyaanValidator,
  updatePertanyaanValidator,
  deletePertanyaanValidator
} from "../middlewares/validators/pertanyaanValidator.js";

const router = Router({mergeParams: true});

// LIST
router.get(
  "/",
  authMiddleware,
  getPertanyaanValidator,
  getPertanyaan
);

// CREATE
router.post(
  "/",
  authMiddleware,
  createPertanyaanValidator,
  createPertanyaan
);

// UPDATE pertanyaan
router.patch(
  "/:id",
  authMiddleware,
  updatePertanyaanValidator,
  updatePertanyaan
);

// DELETE pertanyaan
router.delete(
  "/:id",
  authMiddleware,
  deletePertanyaanValidator,
  deletePertanyaan
);

export default router;
