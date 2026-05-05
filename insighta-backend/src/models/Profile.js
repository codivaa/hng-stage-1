import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
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

// Compound indexes for the most common filter combinations
profileSchema.index({ gender: 1, country_id: 1, age_group: 1 });
profileSchema.index({ age: 1 });
profileSchema.index({ created_at: -1 });
profileSchema.index({ age: -1 });

export default mongoose.model("Profile", profileSchema);