import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }

    const token = authHeader.split(" ")[1];

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
};