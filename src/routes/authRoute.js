import express from "express";
import { login, me, logout, refresh } from "../controllers/authController.js";
import { validateLogin } from "../middlewares/validators/authValidator.js"; 
import { authMiddleware } from "../middlewares/auth.js";
import { createRateLimiter } from "../utils/loginLimit.js";


const router = express.Router();


router.post("/login", validateLogin, login, createRateLimiter);
router.post("/refresh", refresh);
router.get("/me", authMiddleware, me);
router.post("/logout", authMiddleware, logout);


export default router;