import express from "express";
import {
  createMood,
  getMoods,
  getMoodById,
  updateMood,
  deleteMood,
  getMoodStats,
} from "../controllers/mood.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// @route   GET /api/moods/stats
// @desc    Get mood statistics
// Note: This must come before /:id route
router.get("/stats", getMoodStats);

// @route   POST /api/moods
// @desc    Create new mood entry
router.post("/", createMood);

// @route   GET /api/moods
// @desc    Get all moods for logged in user
router.get("/", getMoods);

// @route   GET /api/moods/:id
// @desc    Get single mood by ID
router.get("/:id", getMoodById);

// @route   PUT /api/moods/:id
// @desc    Update mood
router.put("/:id", updateMood);

// @route   DELETE /api/moods/:id
// @desc    Delete mood
router.delete("/:id", deleteMood);

export default router;
