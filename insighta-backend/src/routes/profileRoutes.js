import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { requireApiVersion } from "../middleware/version.js";
import { exportProfiles } from "../controllers/profileController.js";

import {
  createProfile,
  getProfile,
  getProfiles,
  searchProfiles,
  deleteProfile
} from "../controllers/profileController.js";

const router = express.Router();

router.use(protect);
router.use(requireApiVersion);

router.get("/", getProfiles);
router.get("/search", searchProfiles);
router.get("/export", exportProfiles);
router.get("/:id", getProfile);

router.post("/", authorize("admin"), createProfile);
router.delete("/:id", authorize("admin"), deleteProfile);

export default router;