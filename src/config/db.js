import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

// Load env variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Connect to DB
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});