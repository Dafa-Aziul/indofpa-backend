import { Router } from "express";

import {
  getPublicKuesioner,
  submitKuesioner,
  getPublicKuesionerList,
  getPublicKuesionerDetail,
  checkEmailDuplicate
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

router.get("/check-email", checkEmailDuplicate);

// GET Kuesioner Publik
router.get(
  "/isi-kuesioner/:kodeAkses",
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
