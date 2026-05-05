import { Notification } from "../models/Notification.js";

export async function listNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate("booking", "date startTime endTime status")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { readAt: new Date() },
      { new: true }
    );
    if (!notification) {
      const error = new Error("Notification not found.");
      error.statusCode = 404;
      throw error;
    }
    res.json(notification);
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    await Notification.updateMany({ user: req.user._id, readAt: { $exists: false } }, { readAt: new Date() });
    res.json({ message: "Notifications marked as read." });
  } catch (error) {
    next(error);
  }
}
