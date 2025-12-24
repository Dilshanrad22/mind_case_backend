import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/User.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import moodRoutes from "./routes/mood.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

// Middleware
app.use(cors()); // Enable CORS for React Native
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Database connection
connectDB();

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/chat", chatRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "MindCase API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
