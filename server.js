import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/db.js";


const app = express();

connectDB();

app.listen(5000, () => console.log("Server running on port 5000"));
