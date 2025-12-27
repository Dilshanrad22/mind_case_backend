import mongoose from "mongoose";

const dailyNutritionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    totalCalories: {
      type: Number,
      default: 0,
    },
    stepsWalked: {
      type: Number,
      default: 0,
    },
    caloriesBurned: {
      type: Number,
      default: 0,
    },
    remainingCalories: {
      type: Number,
      default: 0,
    },
    stepsNeeded: {
      type: Number,
      default: 0,
    },
    foods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
      },
    ],
  },
  { timestamps: true }
);

// Unique index: one document per user per day
dailyNutritionSchema.index({ user: 1, date: 1 }, { unique: true });

// Calculate calories burned from steps (average: 1 step = 0.04 calories)
dailyNutritionSchema.methods.calculateCaloriesBurned = function () {
  this.caloriesBurned = Math.round(this.stepsWalked * 0.04);
  this.remainingCalories = Math.max(0, this.totalCalories - this.caloriesBurned);
  // Calculate steps needed to burn remaining calories
  this.stepsNeeded = Math.ceil(this.remainingCalories / 0.04);
  return this;
};

export default mongoose.model("DailyNutrition", dailyNutritionSchema);
