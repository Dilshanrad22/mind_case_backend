import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    entry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JournalEntry",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Journal", journalSchema);
