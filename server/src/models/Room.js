import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["classroom", "laboratory", "meeting"], required: true },
    location: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    amenities: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

roomSchema.index({ name: 1, location: 1 }, { unique: true });

export const Room = mongoose.model("Room", roomSchema);
