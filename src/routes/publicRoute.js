import { Router } from "express";

import {
  getPublicKuesioner,
  submitKuesioner
} from "../controllers/publicController.js";

import {
  getPublicKuesionerValidator,
  submitKuesionerValidator
} from "../middlewares/validators/publicValidator.js";

const router = Router();

// ==========================
// GET Kuesioner Publik
// ==========================
router.get(
  "/kuesioner/:kodeAkses",
  getPublicKuesionerValidator,
  getPublicKuesioner
);

// ==========================
// SUBMIT Jawaban Publik
// ==========================
router.post(
  "/kuesioner/:kodeAkses/submit",
  submitKuesionerValidator,
  submitKuesioner
);

export default router;
