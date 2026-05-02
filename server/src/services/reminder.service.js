import cron from "node-cron";
import { Booking } from "../models/Booking.js";
import { bookingReminderEmail } from "./email.service.js";

function dateTimeFromBooking(booking) {
  const [hours, minutes] = booking.startTime.split(":").map(Number);
  const date = new Date(booking.date);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export async function sendUpcomingBookingReminders() {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 60 * 60 * 1000);

  const bookings = await Booking.find({
    status: "approved",
    reminderSent: false,
    date: {
      $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      $lte: new Date(windowEnd.getFullYear(), windowEnd.getMonth(), windowEnd.getDate(), 23, 59, 59, 999)
    }
  })
    .populate("room", "name")
    .populate("user", "name email");

  for (const booking of bookings) {
    const start = dateTimeFromBooking(booking);
    if (start >= now && start <= windowEnd && booking.user?.email) {
      await bookingReminderEmail({ booking });
      booking.reminderSent = true;
      booking.reminderSentAt = new Date();
      await booking.save();
    }
  }
}

export function startReminderScheduler() {
  cron.schedule("0 * * * *", () => {
    sendUpcomingBookingReminders().catch((error) => {
      console.error("Reminder job failed:", error.message);
    });
  });
  console.log("ReserveIT reminder scheduler started");
}
