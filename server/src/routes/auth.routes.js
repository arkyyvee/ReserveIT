import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { validate, loginSchema, registerSchema } from "../utils/validators.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, me);

export default router;
