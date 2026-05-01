import dotenv from "dotenv";

import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();


const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to MongoDB before accepting HTTP requests.
    await connectDB();

    // Start the Express API server.
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Handle port conflicts clearly during local development/deployment.
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Stop the other process or set PORT=...`);
      } else {
        console.error("Server error:", error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
