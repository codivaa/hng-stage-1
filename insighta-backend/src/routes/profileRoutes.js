import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { requireApiVersion } from "../middleware/version.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
import { exportProfiles } from "../controllers/profileController.js";
import { uploadCsv } from "../controllers/uploadController.js";

import {
  createProfile,
  getProfile,
  getProfiles,
  searchProfiles,
  deleteProfile
} from "../controllers/profileController.js";

// Store file in memory as buffer — no disk I/O needed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

const router = express.Router();

router.use(protect);
router.use(apiLimiter);
router.use(requireApiVersion);

router.get("/", getProfiles);
router.get("/search", searchProfiles);
router.get("/export", exportProfiles);
router.get("/:id", getProfile);

router.post("/", authorize("admin"), createProfile);
router.post("/upload", authorize("admin"), upload.single("file"), uploadCsv);
router.delete("/:id", authorize("admin"), deleteProfile);

export default router;