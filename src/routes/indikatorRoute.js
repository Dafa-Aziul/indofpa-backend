import { Router } from "express";

import {
  getIndikator,
  createIndikator,
  updateIndikator,
  deleteIndikator
} from "../controllers/indikatorController.js";

import { authMiddleware } from "../middlewares/auth.js";

import {
  getIndikatorValidator,
  createIndikatorValidator,
  updateIndikatorValidator,
  deleteIndikatorValidator
} from "../middlewares/validators/indikatorValidator.js";

import pertanyaanRoute from "./pertanyaanRoute.js";

const router = Router({ mergeParams: true });

// get indikator list
router.get("/",
  authMiddleware,
  getIndikatorValidator,
  getIndikator
);

// create indikator
router.post("/",
  authMiddleware,
  createIndikatorValidator,
  createIndikator
);

// update indikator
router.patch("/:id",
  authMiddleware,
  updateIndikatorValidator,
  updateIndikator
);

// delete indikator
router.delete("/:id",
  authMiddleware,
  deleteIndikatorValidator,
  deleteIndikator 
);

// nested: pertanyaan
router.use("/:indikatorId/pertanyaan", pertanyaanRoute);

export default router;
