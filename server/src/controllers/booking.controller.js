import { Booking } from "../models/Booking.js";
import { Room } from "../models/Room.js";
import { bookingRequestEmail, bookingStatusEmail } from "../services/email.service.js";
import { findBookingConflict } from "../utils/bookingConflicts.js";
import { logActivity } from "../utils/logActivity.js";
import { normalizeDateOnly } from "../utils/validators.js";

function populateBooking(query) {
  return query.populate("room", "name type location capacity").populate("user", "name email");
}

async function trySendEmail(task) {
  try {
    await task();
  } catch (error) {
    console.error("Email notification failed:", error.message);
  }
}

export async function listBookings(req, res, next) {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    const bookings = await populateBooking(
      Booking.find(filter).sort({ date: -1, startTime: -1, createdAt: -1 })
    );
    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

export async function createBooking(req, res, next) {
  try {
    const room = await Room.findOne({ _id: req.body.room, isActive: true });
    if (!room) {
      const error = new Error("Selected room is unavailable.");
      error.statusCode = 404;
      throw error;
    }

    const date = normalizeDateOnly(req.body.date);
    const conflict = await findBookingConflict({
      room: req.body.room,
      date,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    });

    if (conflict) {
      const error = new Error("This room already has an overlapping pending or approved booking.");
      error.statusCode = 409;
      throw error;
    }

    const booking = await Booking.create({
      ...req.body,
      date,
      user: req.user._id
    });

    await logActivity({
      actor: req.user._id,
      action: "CREATE_BOOKING",
      entity: "Booking",
      entityId: booking._id,
      message: `${req.user.name} requested ${room.name} from ${booking.startTime} to ${booking.endTime}.`
    });

    await trySendEmail(() => bookingRequestEmail({ booking, room, user: req.user }));

    res.status(201).json(await populateBooking(Booking.findById(booking._id)));
  } catch (error) {
    next(error);
  }
}

export async function updateBookingStatus(req, res, next) {
  try {
    const { status, rejectionReason } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      const error = new Error("Status must be approved or rejected.");
      error.statusCode = 400;
      throw error;
    }

    const booking = await Booking.findById(req.params.id).populate("room", "name").populate("user", "name email");
    if (!booking) {
      const error = new Error("Booking not found.");
      error.statusCode = 404;
      throw error;
    }

    if (status === "approved") {
      const conflict = await findBookingConflict({
        room: booking.room._id,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        excludeBookingId: booking._id
      });

      if (conflict) {
        const error = new Error("Approval blocked because this booking overlaps another pending or approved booking.");
        error.statusCode = 409;
        throw error;
      }
    }

    booking.status = status;
    booking.rejectionReason = status === "rejected" ? rejectionReason || "No reason provided." : undefined;
    booking.reviewedBy = req.user._id;
    booking.reviewedAt = new Date();
    await booking.save();

    await logActivity({
      actor: req.user._id,
      action: status === "approved" ? "APPROVE_BOOKING" : "REJECT_BOOKING",
      entity: "Booking",
      entityId: booking._id,
      message: `${req.user.name} ${status} booking for ${booking.room.name}.`,
      metadata: { rejectionReason: booking.rejectionReason }
    });

    await trySendEmail(() => bookingStatusEmail({ booking, room: booking.room, user: booking.user }));

    res.json(await populateBooking(Booking.findById(booking._id)));
  } catch (error) {
    next(error);
  }
}
