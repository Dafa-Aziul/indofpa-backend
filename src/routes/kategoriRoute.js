import { Router } from "express";
import {
  getKategori,
  createKategori,
  updateKategori,
  deleteKategori
} from "../controllers/kategoriController.js";

import { authMiddleware } from "../middlewares/auth.js";
import {
  createKategoriValidator,
  updateKategoriValidator,
  deleteKategoriValidator
} from "../middlewares/validators/kategoriValidator.js";

const router = Router();

router.get("/", authMiddleware, getKategori);
router.post("/", authMiddleware, createKategoriValidator, createKategori);
router.put("/:id", authMiddleware, updateKategoriValidator, updateKategori);
router.delete("/:id", authMiddleware, deleteKategoriValidator, deleteKategori);

export default router;
