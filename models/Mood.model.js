import mongoose from "mongoose";

const moodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    moodType: {
      type: String,
      enum: [
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
      ],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Mood", moodSchema);
