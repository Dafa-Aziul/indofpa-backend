import { Router } from "express";
import authRoute from "./authRoute.js";
import kuesionerRoute from "./kuesionerRoute.js"
import kategoriRoute from "./kategoriRoute.js"
import  indikatorRoute from "./indikatorRoute.js"
import pertanyaanRoute from "./pertanyaanRoute.js"

const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "IndoFPA Backend API is running",
  });
});

router.use("/auth", authRoute);
router.use("/kuesioner", kuesionerRoute);
router.use("/kategori", kategoriRoute);
router.use("/indikator", indikatorRoute);
router.use("/pertanyaan", pertanyaanRoute);

export default router;