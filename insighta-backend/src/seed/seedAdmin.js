import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect directly because seed scripts run outside the Express server.
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // Avoid creating duplicate admin users.
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin already exists:");
      console.log(existingAdmin.email || existingAdmin.username);
      process.exit();
    }

    // Create a seeded admin for testing admin-only routes.
    const admin = await User.create({
      github_id: "seed_admin",
      username: "admin",
      email: "admin@example.com",
      avatar_url: "",
      role: "admin",
      is_active: true,
      last_login_at: new Date()
    });

    console.log("Admin created successfully:");
    console.log(admin);

    process.exit();
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
};

seedAdmin();
