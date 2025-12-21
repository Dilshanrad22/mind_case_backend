import Journal from "../models/Journal.model.js";
import JournalEntry from "../models/JournaleEntry.model.js";

// @desc    Create new journal entry
// @route   POST /api/journals
// @access  Private
export const createJournal = async (req, res) => {
  try {
    const { title, text } = req.body;

    // Validation
    if (!title || !text) {
      return res.status(400).json({ message: "Title and text are required" });
    }

    // Create journal entry
    const journalEntry = await JournalEntry.create({
      title,
      text,
    });

    // Create journal linking user and entry
    const journal = await Journal.create({
      user: req.user.id,
      entry: journalEntry._id,
    });

    // Populate the entry before sending response
    await journal.populate("entry");

    res.status(201).json({
      success: true,
      message: "Journal created successfully",
      data: journal,
    });
  } catch (error) {
    console.error("Create journal error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all journals for logged in user
// @route   GET /api/journals
// @access  Private
export const getJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user.id })
      .populate("entry")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: journals.length,
      data: journals,
    });
  } catch (error) {
    console.error("Get journals error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single journal by ID
// @route   GET /api/journals/:id
// @access  Private
export const getJournalById = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id).populate("entry");

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    // Check if journal belongs to logged in user
    if (journal.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to access this journal" });
    }

    res.status(200).json({
      success: true,
      data: journal,
    });
  } catch (error) {
    console.error("Get journal by ID error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Journal not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update journal
// @route   PUT /api/journals/:id
// @access  Private
export const updateJournal = async (req, res) => {
  try {
    const { title, text } = req.body;

    // Find journal
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    // Check if journal belongs to logged in user
    if (journal.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this journal" });
    }

    // Update journal entry
    const updatedEntry = await JournalEntry.findByIdAndUpdate(
      journal.entry,
      {
        ...(title && { title }),
        ...(text && { text }),
      },
      { new: true, runValidators: true }
    );

    // Get updated journal with populated entry
    const updatedJournal = await Journal.findById(req.params.id).populate("entry");

    res.status(200).json({
      success: true,
      message: "Journal updated successfully",
      data: updatedJournal,
    });
  } catch (error) {
    console.error("Update journal error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Journal not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete journal
// @route   DELETE /api/journals/:id
// @access  Private
export const deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    // Check if journal belongs to logged in user
    if (journal.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this journal" });
    }

    // Delete journal entry first
    await JournalEntry.findByIdAndDelete(journal.entry);

    // Delete journal
    await Journal.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Journal deleted successfully",
    });
  } catch (error) {
    console.error("Delete journal error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Journal not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};
