import { Router } from "express";

// Import semua route
import authRoute from "./authRoute.js";
import kategoriRoute from "./kategoriRoute.js";
import kuesionerRoute from "./kuesionerRoute.js";
import variabelRoute from "./variabelRoute.js";
import indikatorRoute from "./indikatorRoute.js";
import pertanyaanRoute from "./pertanyaanRoute.js";
import publicRoute from "./publicRoute.js";
import monitoringRoute from "./monitoringRoute.js"
import distribusiRoute from "./distribusiRoute.js"
import analisisRoute from "./analisisRoute.js";

const router = Router();

// ===============================
// ROUTE GROUPING
// ===============================

// Auth
router.use("/auth", authRoute);

// Kategori
router.use("/kategori", kategoriRoute);

// Kuesioner
router.use("/kuesioner", kuesionerRoute);

// Variabel
router.use("/variabel", variabelRoute);

// Indikator
router.use("/indikator", indikatorRoute);

// Pertanyaan
router.use("/pertanyaan", pertanyaanRoute);

//distribusi 
router.use("/distribusi", distribusiRoute);
// public
router.use("/public", publicRoute);

// monitoring
router.use("/monitoring", monitoringRoute);

router.use("/analisis", analisisRoute);


export default router;
