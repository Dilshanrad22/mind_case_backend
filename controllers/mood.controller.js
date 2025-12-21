import Mood from "../models/Mood.model.js";

// @desc    Create new mood entry
// @route   POST /api/moods
// @access  Private
export const createMood = async (req, res) => {
  try {
    const { moodType } = req.body;

    // Validation
    if (!moodType) {
      return res.status(400).json({ message: "Mood type is required" });
    }

    const validMoods = [
      "happy",
      "sad",
      "angry",
      "anxious",
      "calm",
      "excited",
      "neutral",
      "stressed",
      "tired",
      "motivated"
    ];

    if (!validMoods.includes(moodType)) {
      return res.status(400).json({ 
        message: "Invalid mood type",
        validMoods 
      });
    }

    // Create mood
    const mood = await Mood.create({
      user: req.user.id,
      moodType,
    });

    res.status(201).json({
      success: true,
      message: "Mood created successfully",
      data: mood,
    });
  } catch (error) {
    console.error("Create mood error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all moods for logged in user
// @route   GET /api/moods
// @access  Private
export const getMoods = async (req, res) => {
  try {
    const { startDate, endDate, moodType } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Filter by mood type if provided
    if (moodType) {
      query.moodType = moodType;
    }

    const moods = await Mood.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: moods.length,
      data: moods,
    });
  } catch (error) {
    console.error("Get moods error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single mood by ID
// @route   GET /api/moods/:id
// @access  Private
export const getMoodById = async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({ message: "Mood not found" });
    }

    // Check if mood belongs to logged in user
    if (mood.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to access this mood" });
    }

    res.status(200).json({
      success: true,
      data: mood,
    });
  } catch (error) {
    console.error("Get mood by ID error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Mood not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update mood
// @route   PUT /api/moods/:id
// @access  Private
export const updateMood = async (req, res) => {
  try {
    const { moodType } = req.body;

    // Find mood
    const mood = await Mood.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({ message: "Mood not found" });
    }

    // Check if mood belongs to logged in user
    if (mood.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this mood" });
    }

    // Validate mood type if provided
    if (moodType) {
      const validMoods = [
        "happy",
        "sad",
        "angry",
        "anxious",
        "calm",
        "excited",
        "neutral",
        "stressed",
        "tired",
        "motivated"
      ];

      if (!validMoods.includes(moodType)) {
        return res.status(400).json({ 
          message: "Invalid mood type",
          validMoods 
        });
      }
    }

    // Update mood
    const updatedMood = await Mood.findByIdAndUpdate(
      req.params.id,
      { moodType },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Mood updated successfully",
      data: updatedMood,
    });
  } catch (error) {
    console.error("Update mood error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Mood not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete mood
// @route   DELETE /api/moods/:id
// @access  Private
export const deleteMood = async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({ message: "Mood not found" });
    }

    // Check if mood belongs to logged in user
    if (mood.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this mood" });
    }

    await Mood.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Mood deleted successfully",
    });
  } catch (error) {
    console.error("Delete mood error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Mood not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get mood statistics
// @route   GET /api/moods/stats
// @access  Private
export const getMoodStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build match query
    const matchQuery = { user: req.user._id };
    
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const stats = await Mood.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$moodType",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          moodType: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get mood stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
