import { Router } from "express";
import { dashboardReport } from "../controllers/report.controller.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/dashboard", protect, requireRole("admin"), dashboardReport);

export default router;
