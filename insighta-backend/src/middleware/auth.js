import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    // Web clients store access tokens in HTTP-only cookies.
    let token = req.cookies?.accessToken;

    // CLI/API clients send access tokens in Authorization: Bearer <token>.
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // No token means the route is protected and the user is not authenticated.
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }

    try {
      // Verify token and attach the decoded user data to req.user for later middleware.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      // Expired tokens return 401 so the web/CLI can try refresh.
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          status: "error",
          message: "Token expired"
        });
      }

      // Any other JWT error means the token is invalid.
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
