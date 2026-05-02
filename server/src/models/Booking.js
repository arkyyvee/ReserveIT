import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    purpose: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    reminderSent: { type: Boolean, default: false },
    reminderSentAt: { type: Date }
  },
  { timestamps: true }
);

bookingSchema.index({ room: 1, date: 1, startTime: 1, endTime: 1, status: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);
