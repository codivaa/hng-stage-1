import mongoose from "mongoose";
import { uuidv7 } from "uuidv7";

// Profile records hold the generated analytics data returned by the API.
const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Prediction/filter fields used by list, search, and export endpoints.
  gender: String,
  gender_probability: Number,
  sample_size: Number,
  age: Number,
  age_group: String,
  country_id: String,
  country_name: String,
  country_probability: Number,
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Profile", profileSchema);
