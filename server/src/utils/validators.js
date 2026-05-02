import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(6).max(80)
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1)
});

export const roomSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(["classroom", "laboratory", "meeting"]),
  location: z.string().min(2).max(120),
  capacity: z.coerce.number().int().min(1).max(500),
  amenities: z.array(z.string().min(1).max(40)).optional().default([]),
  isActive: z.boolean().optional()
});

export const bookingSchema = z
  .object({
    room: z.string().min(1),
    date: z.coerce.date(),
    startTime: z.string().regex(timePattern, "Start time must be HH:mm."),
    endTime: z.string().regex(timePattern, "End time must be HH:mm."),
    purpose: z.string().min(5).max(400)
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "End time must be later than start time.",
    path: ["endTime"]
  });

export function validate(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const error = new Error("Validation failed.");
      error.statusCode = 400;
      error.details = parsed.error.flatten().fieldErrors;
      return next(error);
    }
    req.body = parsed.data;
    next();
  };
}

export function normalizeDateOnly(dateValue) {
  const date = new Date(dateValue);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}
