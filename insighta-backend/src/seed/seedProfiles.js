import mongoose from "mongoose";
import dotenv from "dotenv";
import Profile from "../models/Profile.js";
import { uuidv7 } from "uuidv7";
import data from "./profiles.json" assert { type: "json" };

dotenv.config();

const seed = async () => {
  try {
    // Connect directly because seed scripts run outside the Express server.
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");

    // Insert profiles from profiles.json without duplicating existing names.
    for (const profile of data.profiles) {
      await Profile.updateOne(
        { name: profile.name.toLowerCase() },
        {
          $setOnInsert: {
            id: uuidv7(),
            name: profile.name.toLowerCase(),
            gender: profile.gender,
            gender_probability: profile.gender_probability,
            age: profile.age,
            age_group: profile.age_group,
            country_id: profile.country_id,
            country_name: profile.country_name,
            country_probability: profile.country_probability,
            created_at: new Date().toISOString()
          }
        },
        { upsert: true }
      );
    }

    console.log("Seeding complete");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
