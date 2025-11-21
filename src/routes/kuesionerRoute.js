import { Router } from "express";
import { getKuesionerService } from "../services/kuesionerService";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, getKuesionerService);

export default router;