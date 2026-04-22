import mongoose from "mongoose";
import dotenv from "dotenv";
import Profile from "../models/Profile.js";
import { uuidv7 } from "uuidv7";
import data from "./profiles.json" assert { type: "json" };

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");

    for (const p of data.profiles) {
      await Profile.updateOne(
        { name: p.name.toLowerCase() },
        {
          $setOnInsert: {
            id: uuidv7(),
            name: p.name.toLowerCase(),
            gender: p.gender,
            gender_probability: p.gender_probability,
            age: p.age,
            age_group: p.age_group,
            country_id: p.country_id,
            country_name: p.country_name,
            country_probability: p.country_probability,
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