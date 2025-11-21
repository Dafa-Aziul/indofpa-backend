import { Router } from "express";
import authRoutes from "./authRoute.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "IndoFPA Backend API is running",
  });
});

router.use("/auth", authRoutes);

export default router;