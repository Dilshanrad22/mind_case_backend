import express from "express";
import { signup, login, getProfile, logout } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes
router.get("/profile", protect, getProfile);
router.post("/logout", protect, logout);

export default router;
