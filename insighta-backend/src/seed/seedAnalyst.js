import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import { uuidv7 } from "uuidv7";


dotenv.config();

const seedAnalyst = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    const existingAnalyst = await User.findOne({ role: "analyst" });

    if (existingAnalyst) {
      console.log("⚠️ Analyst already exists:");
      console.log(existingAnalyst.email || existingAnalyst.username);
      process.exit();
    }

    const analyst = await User.create({
        id: uuidv7(),
        github_id: "seed_analyst",
        username: "analyst",
        email: "analyst@example.com",
        avatar_url: "",
        role: "analyst",
        is_active: true,
        last_login_at: new Date()
    });

    console.log("🔥 Analyst created successfully:");
    console.log(analyst);
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedAnalyst();