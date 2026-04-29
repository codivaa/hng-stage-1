import express from "express";
import { githubRedirect, githubCallback, refreshToken, logout, exchangeCode } from "../controllers/authController.js";

const router = express.Router();

router.get("/github", githubRedirect);

router.post("/exchange", exchangeCode);


router.get("/github/callback", githubCallback);


router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;