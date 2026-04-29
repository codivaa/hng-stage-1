import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  github_id: { type: String, required: true, unique: true },
  username: String,
  email: String,
  avatar_url: String,
  role: {
    type: String,
    enum: ["admin", "analyst"],
    default: "analyst"
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  },
  refresh_token: {
  type: String
},
  
});

export default mongoose.model("User", userSchema);