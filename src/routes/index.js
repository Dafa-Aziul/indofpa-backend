import { Router } from "express";
import authRoute from "./authRoute.js";
import kuesionerRoute from "./kuesionerRoute.js"
import kategoriRoute from "./kategoriRoute.js"

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

export default router;