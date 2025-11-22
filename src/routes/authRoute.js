import express from "express";
import { login, me , logout} from "../controllers/authController.js";
import { validateLogin } from "../middlewares/validators/authValidator.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", validateLogin, login);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, me);
export default router;
