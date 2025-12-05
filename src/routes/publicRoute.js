import { Router } from "express";

import {
  getPublicKuesioner,
  submitKuesioner,
  getPublicKuesionerList,
  getPublicKuesionerDetail
} from "../controllers/publicController.js";

import {
  getPublicKuesionerValidator,
  submitKuesionerValidator,
} from "../middlewares/validators/publicValidator.js";

const router = Router();

// GET List Kuesioner Publik
router.get("/kuesioner", getPublicKuesionerList);

// GET Detail Kuesioner Publik
router.get("/kuesioner/:id", getPublicKuesionerDetail);

// GET Kuesioner Publik
router.get(
  "/kuesioner/:kodeAkses",
  getPublicKuesionerValidator,
  getPublicKuesioner
);

// SUBMIT Jawaban Publik
router.post(
  "/kuesioner/:kodeAkses/submit",
  submitKuesionerValidator,
  submitKuesioner
);

export default router;
