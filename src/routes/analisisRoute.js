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

const router = express.Router();

/* ======================================================
   ROUTES ANALISIS KUESIONER
====================================================== */

// 📌 Ambil daftar kuesioner yg siap dianalisis (Publish / Arsip + punya responden)
router.get(
  "/", 
  getAnalisisKuesionerListValidator, 
  getAnalisisKuesionerList
);

// 📌 Ambil hasil analisis lengkap (pertanyaan → indikator → variabel → overall)
router.get(
  "/:kuesionerId",
  getAnalisisValidator,
  getAnalisis
);

// 📌 Update konfigurasi analisis (rentang skor, label interpretasi dll)
router.put(
  "/:kuesionerId/config",
  updateAnalisisConfigValidator,
  updateAnalisisConfig
);

// POST update config analisis
router.post(
  "/:kuesionerId/config",
  updateAnalisisConfigValidator,
  updateAnalisisConfig
);

export default router;
