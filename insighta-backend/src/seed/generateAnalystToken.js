import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

dotenv.config();

const generateAnalystToken = async () => {
  try {
    // Connect directly because token generation runs outside the Express server.
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // Reuse the seeded analyst if it exists, otherwise create one.
    let analyst = await User.findOne({ github_id: "seed_analyst" });

    if (!analyst) {
      analyst = await User.create({
        github_id: "seed_analyst",
        username: "analyst",
        email: "analyst@example.com",
        avatar_url: "",
        role: "analyst",
        is_active: true,
        last_login_at: new Date()
      });
      console.log("Analyst user created:", analyst.username);
    }

    // Generate a fresh token pair and store the refresh token for rotation checks.
    const accessToken = generateAccessToken(analyst);
    const refreshToken = generateRefreshToken(analyst);

    analyst.refresh_token = refreshToken;
    await analyst.save();

    console.log("\nAnalyst tokens generated:\n");
    console.log(`ACCESS_TOKEN=${accessToken}`);
    console.log(`REFRESH_TOKEN=${refreshToken}`);
    console.log(`ROLE=${analyst.role}`);
    console.log(`USER_ID=${analyst._id}`);

    process.exit();
  } catch (err) {
    console.error("Token generation failed:", err.message);
    process.exit(1);
  }
};

generateAnalystToken();
