import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({

  name: { type: String, required: true, unique: true },

  gender: String,
  gender_probability: Number,
  sample_size: Number,

  age: Number,
  age_group: String,

  country_id: String,
  country_probability: Number,

  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Profile", profileSchema);