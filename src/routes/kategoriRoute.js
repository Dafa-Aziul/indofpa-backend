import { Router } from "express";
import { 
    getKategori, 
    createKategori,
    updateKategori,
    deleteKategori, 
} from "../controllers/kategoriController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, getKategori);
router.post("/", authMiddleware, createKategori);
router.put("/:id", authMiddleware, updateKategori);
router.delete("/:id", authMiddleware, deleteKategori);

export default router;