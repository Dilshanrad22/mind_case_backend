import express from "express";
import {
  addFood,
  getTodayNutrition,
  updateSteps,
  getWeeklyNutrition,
  deleteFood,
  getTodayFoods,
} from "../controllers/nutrition.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Food routes
router.post("/foods", addFood);
router.get("/foods/today", getTodayFoods);
router.delete("/foods/:id", deleteFood);

// Daily nutrition routes
router.get("/today", getTodayNutrition);
router.put("/steps", updateSteps);

// Weekly data
router.get("/weekly", getWeeklyNutrition);

export default router;
