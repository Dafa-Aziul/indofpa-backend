import { Router } from "express";

import { 
    getKategori, 
    createKategori,
    updateKategori,
    deleteKategori, 
} from "../controllers/kategoriController.js";

import { authMiddleware } from "../middlewares/auth.js";

import {
    createKategoriValidator,
    updateKategoriValidator,
    deleteKategoriValidator
} from "../middlewares/validators/kategoriValidator.js";

const router = Router();

// GET: Ambil semua kategori
router.get(
    "/", 
    authMiddleware,
    getKategori
);

// POST: Buat kategori baru
router.post(
    "/", 
    authMiddleware,
    createKategoriValidator,   
    createKategori
);

// PUT: Update kategori
router.put(
    "/:id", 
    authMiddleware,
    updateKategoriValidator,   
    updateKategori
);

// DELETE: Hapus kategori
router.delete(
    "/:id", 
    authMiddleware,
    deleteKategoriValidator,   
    deleteKategori
);

export default router;
