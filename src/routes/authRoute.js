import express from "express";
import { login, me, logout, refresh, changePassword } from "../controllers/authController.js";
import { validateLogin, changePasswordValidator} from "../middlewares/validators/authValidator.js";
import { authMiddleware } from "../middlewares/auth.js";
import { createRateLimiter } from "../utils/loginLimit.js";


const router = express.Router();


router.post("/login", validateLogin, login, createRateLimiter);
router.post("/refresh", refresh);
router.get("/me", authMiddleware, me);
router.post("/logout", authMiddleware, logout);
router.patch(
    "/change-password",
    authMiddleware,
    changePasswordValidator,
    changePassword
);

export default router;