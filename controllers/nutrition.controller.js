import Food from "../models/Food.model.js";
import DailyNutrition from "../models/DailyNutrition.model.js";

// Add food entry
export const addFood = async (req, res) => {
  try {
    const { name, calories, quantity } = req.body;
    const userId = req.user.id;

    // Create food entry
    const food = await Food.create({
      user: userId,
      name,
      calories,
      quantity: quantity || 1,
      date: new Date(),
    });

    // Get or create today's nutrition record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyNutrition = await DailyNutrition.findOne({
      user: userId,
      date: today,
    });

    if (!dailyNutrition) {
      dailyNutrition = await DailyNutrition.create({
        user: userId,
        date: today,
        totalCalories: 0,
        stepsWalked: 0,
        foods: [],
      });
    }

    // Update daily nutrition
    dailyNutrition.foods.push(food._id);
    dailyNutrition.totalCalories += calories * (quantity || 1);
    dailyNutrition.calculateCaloriesBurned();
    await dailyNutrition.save();

    res.status(201).json({
      success: true,
      message: "Food added successfully",
      data: {
        food,
        dailyNutrition,
      },
    });
  } catch (error) {
    console.error("Add food error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add food",
      error: error.message,
    });
  }
};

// Get today's nutrition data
export const getTodayNutrition = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyNutrition = await DailyNutrition.findOne({
      user: userId,
      date: today,
    }).populate("foods");

    if (!dailyNutrition) {
      dailyNutrition = await DailyNutrition.create({
        user: userId,
        date: today,
        totalCalories: 0,
        stepsWalked: 0,
        foods: [],
      });
    }

    res.status(200).json({
      success: true,
      data: dailyNutrition,
    });
  } catch (error) {
    console.error("Get today nutrition error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get nutrition data",
      error: error.message,
    });
  }
};

// Update steps walked
export const updateSteps = async (req, res) => {
  try {
    const { steps, addToExisting } = req.body;
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyNutrition = await DailyNutrition.findOne({
      user: userId,
      date: today,
    });

    if (!dailyNutrition) {
      dailyNutrition = await DailyNutrition.create({
        user: userId,
        date: today,
        totalCalories: 0,
        stepsWalked: 0,
        foods: [],
      });
    }

    // If addToExisting is true, add steps to current total; otherwise replace
    if (addToExisting) {
      dailyNutrition.stepsWalked += steps;
    } else {
      dailyNutrition.stepsWalked = steps;
    }
    dailyNutrition.calculateCaloriesBurned();
    await dailyNutrition.save();

    res.status(200).json({
      success: true,
      message: "Steps updated successfully",
      data: dailyNutrition,
    });
  } catch (error) {
    console.error("Update steps error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update steps",
      error: error.message,
    });
  }
};

// Get weekly nutrition data
export const getWeeklyNutrition = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const weeklyData = await DailyNutrition.find({
      user: userId,
      date: { $gte: weekAgo, $lte: today },
    })
      .sort({ date: 1 })
      .populate("foods");

    // Calculate weekly totals
    const totals = weeklyData.reduce(
      (acc, day) => {
        acc.totalCalories += day.totalCalories;
        acc.totalSteps += day.stepsWalked;
        acc.totalCaloriesBurned += day.caloriesBurned;
        return acc;
      },
      { totalCalories: 0, totalSteps: 0, totalCaloriesBurned: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        weeklyData,
        totals,
        averages: {
          avgCalories: Math.round(totals.totalCalories / 7),
          avgSteps: Math.round(totals.totalSteps / 7),
          avgCaloriesBurned: Math.round(totals.totalCaloriesBurned / 7),
        },
      },
    });
  } catch (error) {
    console.error("Get weekly nutrition error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get weekly nutrition data",
      error: error.message,
    });
  }
};

// Delete food entry
export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const food = await Food.findOne({ _id: id, user: userId });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food entry not found",
      });
    }

    const foodDate = new Date(food.date);
    foodDate.setHours(0, 0, 0, 0);

    // Update daily nutrition
    const dailyNutrition = await DailyNutrition.findOne({
      user: userId,
      date: foodDate,
    });

    if (dailyNutrition) {
      dailyNutrition.foods = dailyNutrition.foods.filter(
        (foodId) => foodId.toString() !== id
      );
      dailyNutrition.totalCalories -= food.calories * food.quantity;
      dailyNutrition.totalCalories = Math.max(0, dailyNutrition.totalCalories);
      dailyNutrition.calculateCaloriesBurned();
      await dailyNutrition.save();
    }

    await Food.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Food entry deleted successfully",
      data: dailyNutrition,
    });
  } catch (error) {
    console.error("Delete food error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete food entry",
      error: error.message,
    });
  }
};

// Get today's foods list
export const getTodayFoods = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const foods = await Food.find({
      user: userId,
      date: { $gte: today, $lt: tomorrow },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: foods,
    });
  } catch (error) {
    console.error("Get today foods error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get foods",
      error: error.message,
    });
  }
};
