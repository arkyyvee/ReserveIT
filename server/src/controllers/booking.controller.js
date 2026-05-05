import { Booking } from "../models/Booking.js";
import { Room } from "../models/Room.js";
import { bookingRequestEmail, bookingStatusEmail } from "../services/email.service.js";
import { createNotification } from "../services/notification.service.js";
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

function addRecurrenceDate(date, recurrence, index) {
  const next = new Date(date);
  if (recurrence === "weekly") next.setUTCDate(next.getUTCDate() + index * 7);
  if (recurrence === "monthly") next.setUTCMonth(next.getUTCMonth() + index);
  return next;
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

    const recurrence = req.body.recurrence || "none";
    const occurrenceCount = recurrence === "none" ? 1 : req.body.occurrenceCount || 1;
    const baseDate = normalizeDateOnly(req.body.date);
    const dates = Array.from({ length: occurrenceCount }, (_item, index) =>
      addRecurrenceDate(baseDate, recurrence, index)
    );

    for (const date of dates) {
      const conflict = await findBookingConflict({
        room: req.body.room,
        date,
        startTime: req.body.startTime,
        endTime: req.body.endTime
      });

      if (conflict) {
        const error = new Error("One or more requested dates overlap an existing pending or approved booking.");
        error.statusCode = 409;
        throw error;
      }
    }

    const seriesId = recurrence === "none" ? undefined : `${req.user._id}-${Date.now()}`;
    const createdBookings = await Booking.insertMany(
      dates.map((date) => ({
        room: req.body.room,
        date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        purpose: req.body.purpose,
        recurrence,
        seriesId,
        user: req.user._id
      }))
    );
    const booking = createdBookings[0];

    await logActivity({
      actor: req.user._id,
      action: "CREATE_BOOKING",
      entity: "Booking",
      entityId: booking._id,
      message: `${req.user.name} requested ${room.name} from ${booking.startTime} to ${booking.endTime}.`
    });

    await createNotification({
      user: req.user._id,
      booking: booking._id,
      title: "Booking request submitted",
      message: `${room.name} is pending approval${createdBookings.length > 1 ? ` for ${createdBookings.length} dates` : ""}.`,
      type: "booking"
    });
    await trySendEmail(() => bookingRequestEmail({ booking, room, user: req.user }));

    res.status(201).json({
      booking: await populateBooking(Booking.findById(booking._id)),
      count: createdBookings.length
    });
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

    await createNotification({
      user: booking.user._id,
      booking: booking._id,
      title: `Booking ${status}`,
      message: `${booking.room.name} was ${status} for ${booking.date.toISOString().slice(0, 10)}.`,
      type: status === "approved" ? "approval" : "rejection"
    });
    await trySendEmail(() => bookingStatusEmail({ booking, room: booking.room, user: booking.user }));

    res.json(await populateBooking(Booking.findById(booking._id)));
  } catch (error) {
    next(error);
  }
}

export async function rescheduleBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id).populate("room", "name").populate("user", "name email");
    if (!booking) {
      const error = new Error("Booking not found.");
      error.statusCode = 404;
      throw error;
    }

    const date = normalizeDateOnly(req.body.date);
    const conflict = await findBookingConflict({
      room: booking.room._id,
      date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      excludeBookingId: booking._id
    });

    if (conflict) {
      const error = new Error("Reschedule blocked because this time overlaps another booking.");
      error.statusCode = 409;
      throw error;
    }

    booking.date = date;
    booking.startTime = req.body.startTime;
    booking.endTime = req.body.endTime;
    booking.reminderSent = false;
    booking.reminderSentAt = undefined;
    await booking.save();

    await logActivity({
      actor: req.user._id,
      action: "RESCHEDULE_BOOKING",
      entity: "Booking",
      entityId: booking._id,
      message: `${req.user.name} rescheduled booking for ${booking.room.name}.`
    });
    await createNotification({
      user: booking.user._id,
      booking: booking._id,
      title: "Booking rescheduled",
      message: `${booking.room.name} was moved to ${booking.date.toISOString().slice(0, 10)} from ${booking.startTime} to ${booking.endTime}.`,
      type: "booking"
    });

    res.json(await populateBooking(Booking.findById(booking._id)));
  } catch (error) {
    next(error);
  }
}
