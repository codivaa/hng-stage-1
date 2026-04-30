import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

dotenv.config();

const generateAnalystToken = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

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
      console.log("✅ Analyst user created:", analyst.username);
    }

    const accessToken = generateAccessToken(analyst);
    const refreshToken = generateRefreshToken(analyst);

    analyst.refresh_token = refreshToken;
    await analyst.save();

    console.log("\n✅ Analyst tokens generated:\n");
    console.log(`ACCESS_TOKEN=${accessToken}`);
    console.log(`REFRESH_TOKEN=${refreshToken}`);
    console.log(`ROLE=analyst`);
    console.log(`USER_ID=${analyst._id}`);

    process.exit();
  } catch (err) {
    console.error("❌ Token generation failed:", err.message);
    process.exit(1);
  }
};

generateAnalystToken();