import express from "express";
import { 
  sendMessage, 
  getChatHistory, 
  getChats, 
  createNewChat, 
  deleteChat,
  clearChatMessages 
} from "../controllers/chat.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Chat routes
router.post("/message", sendMessage);
router.post("/new", createNewChat);
router.get("/", getChats);
router.get("/:chatId", getChatHistory);
router.delete("/:chatId", deleteChat);
router.delete("/:chatId/messages", clearChatMessages);

export default router;
