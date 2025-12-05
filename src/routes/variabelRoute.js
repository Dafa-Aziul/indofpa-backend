import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";

import {
  getVariabel,
  createVariabel,
  updateVariabel,
  deleteVariabel
} from "../controllers/variabelController.js";

import {
  getVariabelValidator,
  createVariabelValidator,
  updateVariabelValidator,
  deleteVariabelValidator
} from "../middlewares/validators/variabelValidator.js";

import indikatorRoute from "./indikatorRoute.js";

const router = Router({ mergeParams: true });

// nested indikator
router.use("/:variabelId/indikator", indikatorRoute);

// GET list variabel
router.get(
  "/",
  authMiddleware,
  getVariabelValidator,
  getVariabel
);

// CREATE variabel
router.post(
  "/",
  authMiddleware,
  createVariabelValidator,
  createVariabel
);

// UPDATE variabel
router.patch(
  "/:id",
  authMiddleware,
  updateVariabelValidator,
  updateVariabel
);

// DELETE variabel
router.delete(
  "/:id",
  authMiddleware,
  deleteVariabelValidator,
  deleteVariabel
);

export default router;
