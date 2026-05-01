import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { requireApiVersion } from "../middleware/version.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
import { exportProfiles } from "../controllers/profileController.js";

import {
  createProfile,
  getProfile,
  getProfiles,
  searchProfiles,
  deleteProfile
} from "../controllers/profileController.js";

const router = express.Router();

// Every profile route requires a valid access token, rate limiting, and API versioning.
router.use(protect);
router.use(apiLimiter);
router.use(requireApiVersion);

// Analyst/admin read routes.
router.get("/", getProfiles);
router.get("/search", searchProfiles);
router.get("/export", exportProfiles);
router.get("/:id", getProfile);

// Admin-only write routes.
router.post("/", authorize("admin"), createProfile);
router.delete("/:id", authorize("admin"), deleteProfile);

export default router;
