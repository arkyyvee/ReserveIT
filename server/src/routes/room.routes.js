import { Router } from "express";
import { createRoom, deleteRoom, listRooms, updateRoom } from "../controllers/room.controller.js";
import { protect, requireRole } from "../middleware/auth.js";
import { roomSchema, validate } from "../utils/validators.js";

const router = Router();

router.get("/", protect, listRooms);
router.post("/", protect, requireRole("admin"), validate(roomSchema), createRoom);
router.put("/:id", protect, requireRole("admin"), validate(roomSchema), updateRoom);
router.delete("/:id", protect, requireRole("admin"), deleteRoom);

export default router;
