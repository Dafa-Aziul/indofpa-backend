import express from "express";

import { 
  getAnalisisKuesionerList,
  getAnalisis,
  updateAnalisisConfig
} from "../controllers/analisisController.js";

import {
  getAnalisisKuesionerListValidator,
  getAnalisisValidator,
  updateAnalisisConfigValidator
} from "../middlewares/validators/analisisValidator.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

/* ======================================================
   ROUTES ANALISIS KUESIONER
====================================================== */

// 📌 Ambil daftar kuesioner yg siap dianalisis (Publish / Arsip + punya responden)
router.get(
  "/", 
  getAnalisisKuesionerListValidator, 
  authMiddleware,
  getAnalisisKuesionerList
);

// 📌 Ambil hasil analisis lengkap (pertanyaan → indikator → variabel → overall)
router.get(
  "/:kuesionerId",
    authMiddleware,
  getAnalisisValidator,
  getAnalisis
);

// 📌 Update konfigurasi analisis (rentang skor, label interpretasi dll)
router.put(
  "/:kuesionerId/config",
  authMiddleware,
  updateAnalisisConfigValidator,
  updateAnalisisConfig
);

// POST update config analisis
router.post(
  "/:kuesionerId/config",
  authMiddleware,
  updateAnalisisConfigValidator,
  updateAnalisisConfig
);

export default router;
