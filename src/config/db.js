import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://sasseraangell_db_user:XCRWa5f9iWAWJxB0@ac-q1undwe-shard-00-00.fbmlsze.mongodb.net:27017,ac-q1undwe-shard-00-01.fbmlsze.mongodb.net:27017,ac-q1undwe-shard-00-02.fbmlsze.mongodb.net:27017/hng_stage1?ssl=true&replicaSet=atlas-13em8q-shard-0&authSource=admin&appName=Cluster0");

    console.log("Database connected");
  } catch (error) {
    console.error("DB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;