import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Connecting to DB...");

    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10 // reuse connections, prevents reconnect overhead under load
    });

    console.log("Database connected");
  } catch (error) {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;