import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Connecting to DB...");

    // MONGO_URI comes from .env and points to the MongoDB database.
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Database connected");
  } catch (error) {
    // Stop the server if the database connection fails.
    console.error("DB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
