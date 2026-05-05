import { Log } from "../models/Log.js";

export async function listLogs(_req, res, next) {
  try {
    const { action, user, entity, dateFrom, dateTo } = _req.query;
    const filter = {};
    if (action) filter.action = new RegExp(action, "i");
    if (entity) filter.entity = entity;
    if (user) filter.actor = user;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const logs = await Log.find(filter)
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    next(error);
  }
}
