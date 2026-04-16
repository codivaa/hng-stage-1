import express from "express";
import {
  createProfile,
  getProfile,
  getProfiles,
  deleteProfile
} from "../controllers/profileController.js"

const router = express.Router();

router.post("/", createProfile);
router.get("/", getProfiles);
router.get("/:id", getProfile);
router.delete("/:id", deleteProfile);

export default router;