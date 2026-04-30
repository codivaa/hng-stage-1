import session from "express-session";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import profileRoutes from "./routes/profileRoutes.js";
import authRoutes from "./routes/auth.js";
import { authLimiter } from "./middleware/rateLimiter.js";
import { logger } from "./middleware/logger.js";

const app = express();

app.use(express.json());

// 🍪 Parse cookies
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV !== "development",
    httpOnly: true,
    sameSite: "lax"
  }
}));

app.use(logger);
app.use("/api/v1/auth", authLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profiles", profileRoutes);

app.get("/", (req, res) => {
  res.send("HNG Stage 1 API is running 🚀");
});

export default app;