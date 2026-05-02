import nodemailer from "nodemailer";

function emailEnabled() {
  return process.env.EMAIL_NOTIFICATIONS_ENABLED === "true" && process.env.SMTP_USER && process.env.SMTP_PASS;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export async function sendEmail({ to, subject, text, html }) {
  if (!emailEnabled()) {
    console.log(`Email skipped: ${subject}`);
    return { skipped: true };
  }

  const transporter = createTransporter();
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  });
}

export function bookingRequestEmail({ booking, room, user }) {
  return sendEmail({
    to: user.email,
    subject: "ReserveIT booking request received",
    text: `Your booking request for ${room.name} on ${booking.date.toISOString().slice(0, 10)} from ${booking.startTime} to ${booking.endTime} is pending admin approval.`,
    html: `<p>Your booking request for <strong>${room.name}</strong> is pending admin approval.</p><p>${booking.date.toISOString().slice(0, 10)} from ${booking.startTime} to ${booking.endTime}</p>`
  });
}

export function bookingStatusEmail({ booking, room, user }) {
  const approved = booking.status === "approved";
  return sendEmail({
    to: user.email,
    subject: `ReserveIT booking ${booking.status}`,
    text: `Your booking for ${room.name} on ${booking.date.toISOString().slice(0, 10)} has been ${booking.status}.`,
    html: `<p>Your booking for <strong>${room.name}</strong> has been <strong>${booking.status}</strong>.</p><p>${booking.date.toISOString().slice(0, 10)} from ${booking.startTime} to ${booking.endTime}</p>${approved ? "" : `<p>Reason: ${booking.rejectionReason || "No reason provided."}</p>`}`
  });
}

export function bookingReminderEmail({ booking }) {
  return sendEmail({
    to: booking.user.email,
    subject: "ReserveIT booking reminder",
    text: `Reminder: ${booking.room.name} is booked today from ${booking.startTime} to ${booking.endTime}.`,
    html: `<p>Reminder: <strong>${booking.room.name}</strong> is booked today from ${booking.startTime} to ${booking.endTime}.</p>`
  });
}
