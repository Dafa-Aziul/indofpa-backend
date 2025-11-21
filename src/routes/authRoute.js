import express from "express";
import { login, me , logout} from "../controllers/authController.js";
import { validateLogin } from "../validators/authValidator.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", validateLogin, login);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, me);
export default router;
