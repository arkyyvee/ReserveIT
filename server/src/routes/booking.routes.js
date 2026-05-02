import { Router } from "express";
import { createBooking, listBookings, updateBookingStatus } from "../controllers/booking.controller.js";
import { protect, requireRole } from "../middleware/auth.js";
import { bookingSchema, validate } from "../utils/validators.js";

const router = Router();

router.get("/", protect, listBookings);
router.post("/", protect, validate(bookingSchema), createBooking);
router.patch("/:id/status", protect, requireRole("admin"), updateBookingStatus);

export default router;
