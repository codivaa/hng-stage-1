import express from "express";
import cors from "cors";
import profileRoutes from "./routes/profileRoutes.js";

const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/profiles", profileRoutes);

export default app;