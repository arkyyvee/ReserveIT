import { Booking } from "../models/Booking.js";

export async function findBookingConflict({ room, date, startTime, endTime, excludeBookingId }) {
  const query = {
    room,
    date,
    status: { $in: ["pending", "approved"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return Booking.findOne(query).populate("user", "name email").populate("room", "name");
}
