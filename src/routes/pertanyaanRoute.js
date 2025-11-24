import { Router } from "express";
import { createPertanyaan, updatePertanyaan, deletePertanyaan, getPertanyaanByKuesioner } from "../controllers/pertanyaanController.js";

import { authMiddleware } from "../middlewares/auth.js";

import { 
    createPertanyaanValidator, 
    updatePertanyaanValidator , 
    deletePertanyaanValidator
} from "../middlewares/validators/pertanyaanValidator.js";

const router = Router({mergeParams: true});

router.get("/kuesioner/:kuesionerId", authMiddleware, getPertanyaanByKuesioner)

router.post(
    "/:kuesionerId",
    authMiddleware, 
    createPertanyaanValidator,
    createPertanyaan
);

router.put(
    "/:id",
    authMiddleware,
    updatePertanyaanValidator,
    updatePertanyaan,
);

router.delete(
    "/:id",
    authMiddleware,
    deletePertanyaanValidator,
    deletePertanyaan
);


export default router;