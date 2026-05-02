import { Log } from "../models/Log.js";

export async function listLogs(_req, res, next) {
  try {
    const logs = await Log.find()
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    next(error);
  }
}
