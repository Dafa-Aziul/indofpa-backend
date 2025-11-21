import { Router } from "express";
import { getKuesioner } from "../controllers/kuesionerController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, getKuesioner);

export default router;