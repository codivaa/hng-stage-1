import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    // Check for token in cookies (HTTP-only)
    let token = req.cookies?.accessToken;

    // Fallback to Authorization header for CLI/API clients
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      // 🔥 HANDLE EXPIRED TOKEN
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          status: "error",
          message: "Token expired"
        });
      }

      // 🔥 OTHER ERRORS
      return res.status(401).json({
        status: "error",
        message: "Invalid token"
      });
    }
  } catch (err) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized"
    });
  }
};