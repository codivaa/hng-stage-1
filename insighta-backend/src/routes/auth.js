import express from "express";
import { githubRedirect, githubCallback, refreshToken, logout, exchangeCode, getCurrentUser } from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/github", authLimiter, githubRedirect);

router.post("/exchange", exchangeCode);

router.get("/github/callback", githubCallback);

router.post("/refresh", refreshToken);
router.all("/refresh", (req, res) => {
  return res.status(405).json({ status: "error", message: "POST required" });
});

router.post("/logout", logout);
router.all("/logout", (req, res) => {
  return res.status(405).json({ status: "error", message: "POST required" });
});

router.get("/me", getCurrentUser);

export default router;
