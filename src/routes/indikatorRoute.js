import { Router } from "express";

import { 
    createIndikator,
    deleteIndikator,
    getIndikator,
    updateIndikator, 
} from "../controllers/indikatorController.js";

import { authMiddleware } from "../middlewares/auth.js";

import { 
    createIndikatorValidator, 
    deleteIndikatorValidator, 
    updateIndikatorValidator 
} from "../middlewares/validators/indikatorValidator.js";

const router = Router({ mergeParams: true });

// GET semua indikator pada 1 kuesioner
router.get(
    "/:kuesionerId/",
    authMiddleware,
    getIndikator
);

// CREATE indikator
router.post(
    "/kuesioner/:kuesionerId",
    authMiddleware,
    createIndikatorValidator,
    createIndikator
);

// UPDATE indikator
router.patch(
    "/:id",
    authMiddleware,
    updateIndikatorValidator,
    updateIndikator
);

router.delete(
    "/:id", 
    authMiddleware, 
    deleteIndikatorValidator, 
    deleteIndikator);

export default router;
