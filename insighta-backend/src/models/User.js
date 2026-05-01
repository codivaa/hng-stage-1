import mongoose from "mongoose";
import { uuidv7 } from "uuidv7";

// User records are created from GitHub OAuth profiles.
const userSchema = new mongoose.Schema({
  // Public app id uses UUID v7 instead of exposing MongoDB _id.
  id: {
    type: String,
    unique: true,
    default: () => uuidv7()
  },
  // github_id is unique so the same GitHub user maps to one account.
  github_id: { type: String, required: true, unique: true },
  username: String,
  email: String,
  avatar_url: String,
  role: {
    // Role controls authorization: admins can write, analysts can read.
    type: String,
    enum: ["admin", "analyst"],
    default: "analyst"
  },
  is_active: {
    // If false, the user should be blocked from protected actions.
    type: Boolean,
    default: true
  },
  last_login_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  },
  refresh_token: {
    // Latest valid refresh token. Rotation replaces this value.
    type: String
  },
  
});

export default mongoose.model("User", userSchema);
