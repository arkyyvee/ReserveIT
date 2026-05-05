import { Notification } from "../models/Notification.js";

export async function createNotification({ user, booking, title, message, type = "system" }) {
  if (!user) return null;
  return Notification.create({ user, booking, title, message, type });
}
