import { Booking } from "../models/Booking.js";
import { Room } from "../models/Room.js";

export async function dashboardReport(_req, res, next) {
  try {
    const [rooms, statusCounts, topRooms, peakHours] = await Promise.all([
      Room.countDocuments(),
      Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Booking.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: "$room", bookings: { $sum: 1 } } },
        { $sort: { bookings: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "rooms",
            localField: "_id",
            foreignField: "_id",
            as: "room"
          }
        },
        { $unwind: "$room" },
        { $project: { room: "$room.name", bookings: 1 } }
      ]),
      Booking.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: "$startTime", bookings: { $sum: 1 } } },
        { $sort: { bookings: -1 } },
        { $limit: 8 },
        { $project: { hour: "$_id", bookings: 1, _id: 0 } }
      ])
    ]);

    const counts = statusCounts.reduce(
      (acc, item) => ({ ...acc, [item._id]: item.count }),
      { pending: 0, approved: 0, rejected: 0 }
    );

    const approvedTotal = counts.approved || 0;
    const utilization = rooms ? Math.round((approvedTotal / Math.max(rooms * 30, 1)) * 100) : 0;

    res.json({ rooms, counts, topRooms, peakHours, utilization });
  } catch (error) {
    next(error);
  }
}
