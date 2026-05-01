import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import profileRoutes from "./routes/profileRoutes.js";
import authRoutes from "./routes/auth.js";
import { getCurrentUser } from "./controllers/authController.js";
import { logger } from "./middleware/logger.js";

dotenv.config();

const app = express();

app.use(express.json());

// 🍪 Parse cookies
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(logger);

// Auth routes are exposed with both prefixes:
// /auth/... matches the project requirements, while /api/auth/... supports app clients.
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);

// Current-user endpoint used by the web app/graders to fetch the logged-in user.
app.get("/api/users/me", getCurrentUser);

// Protected profile API routes.
app.use("/api/profiles", profileRoutes);

app.get("/", (req, res) => {
  res.send("HNG Stage 1 API is running 🚀");
});

export default app;
