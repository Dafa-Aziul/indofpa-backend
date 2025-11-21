import { Router } from "express";
import {
    getKuesioner,
    createKuesioner,
    updateKuesioner,
    deleteKuesioner,
    getKuesionerById
} from "../controllers/kuesionerController.js";
import { authMiddleware } from "../middleware/auth.js";
import { 
    validateCreateKuesioner, 
    validateDeleteKuesioner, 
    validateUpdateKuesioner 
} from "../validators/kuesionerValidator.js";

const router = Router();

router.get("/", authMiddleware, getKuesioner);
router.get("/:id", authMiddleware, getKuesionerById)
router.post("/", authMiddleware, validateCreateKuesioner, createKuesioner);
router.patch("/:id", authMiddleware, validateUpdateKuesioner, updateKuesioner);
router.delete("/:id", authMiddleware, validateDeleteKuesioner, deleteKuesioner);


export default router;