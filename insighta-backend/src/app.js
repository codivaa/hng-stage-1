import session from "express-session";
import express from "express";
import cors from "cors";
import profileRoutes from "./routes/profileRoutes.js";
import authRoutes from "./routes/auth.js";
import { authLimiter, apiLimiter } from "./middleware/rateLimiter.js";
import { logger } from "./middleware/logger.js";

const app = express();

app.use(express.json());

app.use(cors());


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV !== "development" } // true only with HTTPS
}));

app.use("/api/v1/profiles", profileRoutes);

app.get("/", (req, res) => {
  res.send("HNG Stage 1 API is running 🚀");
});

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/auth", authLimiter);
app.use("/api", apiLimiter);

app.use(logger);

export default app;