import { Router } from "express";
import {
    getKuesioner,
    createKuesioner,
    updateKuesioner,
    deleteKuesioner,
    getKuesionerById
} from "../controllers/kuesionerController.js";

import { authMiddleware } from "../middlewares/auth.js";

import { 
    createKuesionerValidator, 
    updateKuesionerValidator, 
    deleteKuesionerValidator 
} from "../middlewares/validators/kuesionerValidator.js";

import indikatorRoute from "../routes/indikatorRoute.js";

const router = Router();

// GET (tidak butuh validator)
router.get("/", authMiddleware, getKuesioner);

router.get("/:id", authMiddleware, getKuesionerById);

// POST
router.post(
  "/", 
  authMiddleware,
  createKuesionerValidator,   
  createKuesioner
);

// PATCH
router.patch(
  "/:id",
  authMiddleware,
  updateKuesionerValidator,  
  updateKuesioner
);

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  deleteKuesionerValidator,  
  deleteKuesioner
);

export default router;
