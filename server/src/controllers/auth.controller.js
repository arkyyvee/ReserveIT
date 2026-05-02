import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { logActivity } from "../utils/logActivity.js";

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

function userPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export async function register(req, res, next) {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      const error = new Error("An account with this email already exists.");
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create(req.body);
    await logActivity({
      actor: user._id,
      action: "REGISTER",
      entity: "User",
      entityId: user._id,
      message: `${user.name} registered a ReserveIT account.`
    });

    res.status(201).json({ token: signToken(user), user: userPayload(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.comparePassword(req.body.password))) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    await logActivity({
      actor: user._id,
      action: "LOGIN",
      entity: "User",
      entityId: user._id,
      message: `${user.name} signed in.`
    });

    res.json({ token: signToken(user), user: userPayload(user) });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ user: userPayload(req.user) });
}
