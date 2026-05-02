import { Room } from "../models/Room.js";
import { logActivity } from "../utils/logActivity.js";

export async function listRooms(req, res, next) {
  try {
    const filter = req.user?.role === "admin" ? {} : { isActive: true };
    const rooms = await Room.find(filter).sort({ type: 1, name: 1 });
    res.json(rooms);
  } catch (error) {
    next(error);
  }
}

export async function createRoom(req, res, next) {
  try {
    const room = await Room.create(req.body);
    await logActivity({
      actor: req.user._id,
      action: "CREATE_ROOM",
      entity: "Room",
      entityId: room._id,
      message: `${req.user.name} added ${room.name}.`
    });
    res.status(201).json(room);
  } catch (error) {
    if (error.code === 11000) {
      error.message = "A room with this name and location already exists.";
      error.statusCode = 409;
    }
    next(error);
  }
}

export async function updateRoom(req, res, next) {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!room) {
      const error = new Error("Room not found.");
      error.statusCode = 404;
      throw error;
    }

    await logActivity({
      actor: req.user._id,
      action: "UPDATE_ROOM",
      entity: "Room",
      entityId: room._id,
      message: `${req.user.name} updated ${room.name}.`
    });
    res.json(room);
  } catch (error) {
    next(error);
  }
}

export async function deleteRoom(req, res, next) {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      const error = new Error("Room not found.");
      error.statusCode = 404;
      throw error;
    }

    await logActivity({
      actor: req.user._id,
      action: "DELETE_ROOM",
      entity: "Room",
      entityId: room._id,
      message: `${req.user.name} deleted ${room.name}.`
    });
    res.json({ message: "Room deleted." });
  } catch (error) {
    next(error);
  }
}
