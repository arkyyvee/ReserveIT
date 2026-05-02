import { Router } from "express";
import { listLogs } from "../controllers/log.controller.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, requireRole("admin"), listLogs);

export default router;
