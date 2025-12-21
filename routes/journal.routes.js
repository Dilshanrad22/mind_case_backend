import express from "express";
import {
  createJournal,
  getJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
} from "../controllers/journal.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// @route   POST /api/journals
// @desc    Create new journal
router.post("/", createJournal);

// @route   GET /api/journals
// @desc    Get all journals for logged in user
router.get("/", getJournals);

// @route   GET /api/journals/:id
// @desc    Get single journal by ID
router.get("/:id", getJournalById);

// @route   PUT /api/journals/:id
// @desc    Update journal
router.put("/:id", updateJournal);

// @route   DELETE /api/journals/:id
// @desc    Delete journal
router.delete("/:id", deleteJournal);

export default router;
