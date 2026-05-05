import { Router } from "express";
import { login, me, register, updatePassword, updateProfile } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { validate, loginSchema, passwordSchema, profileSchema, registerSchema } from "../utils/validators.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, me);
router.put("/profile", protect, validate(profileSchema), updateProfile);
router.put("/password", protect, validate(passwordSchema), updatePassword);

export default router;
