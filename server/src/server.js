import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { startReminderScheduler } from "./services/reminder.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const port = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`ReserveIT API running on http://localhost:${port}`);
      startReminderScheduler();
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
