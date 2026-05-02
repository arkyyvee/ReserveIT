import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { Room } from "./models/Room.js";
import { User } from "./models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

await connectDB(process.env.MONGO_URI);

await User.deleteMany({});
await Room.deleteMany({});

await User.create([
  { name: "ReserveIT Admin", email: "admin@reserveit.local", password: "admin123", role: "admin" },
  { name: "Sample User", email: "user@reserveit.local", password: "user123", role: "user" }
]);

await Room.create([
  {
    name: "Classroom 204",
    type: "classroom",
    location: "Academic Building 2",
    capacity: 45,
    amenities: ["Projector", "Whiteboard", "Air conditioning"]
  },
  {
    name: "Chemistry Lab A",
    type: "laboratory",
    location: "Science Wing",
    capacity: 28,
    amenities: ["Lab benches", "Safety shower", "Fume hood"]
  },
  {
    name: "Strategy Meeting Room",
    type: "meeting",
    location: "Administration Floor",
    capacity: 14,
    amenities: ["Display screen", "Conference camera", "Speakerphone"]
  }
]);

console.log("Seed complete");
process.exit(0);
