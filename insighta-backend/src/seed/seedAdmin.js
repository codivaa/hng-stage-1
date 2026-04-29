import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    // 🔍 Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists:");
      console.log(existingAdmin.email || existingAdmin.username);
      process.exit();
    }

    // 🚀 Create admin manually
    const admin = await User.create({
      github_id: "seed_admin", // dummy
      username: "admin",
      email: "admin@example.com",
      avatar_url: "",
      role: "admin",
      is_active: true,
      last_login_at: new Date()
    });

    console.log("🔥 Admin created successfully:");
    console.log(admin);

    process.exit();

  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedAdmin();