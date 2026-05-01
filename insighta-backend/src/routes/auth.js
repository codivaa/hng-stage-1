import express from "express";
import { githubRedirect, githubCallback, refreshToken, logout, exchangeCode, getCurrentUser } from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Starts GitHub OAuth. The limiter protects the login endpoint from abuse.
router.get("/github", authLimiter, githubRedirect);

// CLI uses this endpoint to exchange the callback code for app tokens.
router.post("/exchange", exchangeCode);

// GitHub redirects back here after the user authorizes the app.
router.get("/github/callback", githubCallback);

// Refresh must be POST because it rotates and invalidates refresh tokens.
router.post("/refresh", refreshToken);
router.all("/refresh", (req, res) => {
  return res.status(405).json({ status: "error", message: "POST required" });
});

// Logout must be POST because it invalidates the saved refresh token.
router.post("/logout", logout);
router.all("/logout", (req, res) => {
  return res.status(405).json({ status: "error", message: "POST required" });
});

// Alternate current-user endpoint under /api/auth/me.
router.get("/me", getCurrentUser);

export default router;
