import Chat from "../models/Chat.model.js";
import Mood from "../models/Mood.model.js";
import Journal from "../models/Journal.model.js";

// System prompt for the Mental Wellness Companion
const SYSTEM_PROMPT = `You are MindBot, a compassionate and empathetic mental wellness companion in the MindCase app. 

Your role:
- Provide emotional support and active listening
- Help users reflect on their feelings and thoughts
- Suggest healthy coping strategies (breathing exercises, grounding techniques, journaling prompts)
- Offer encouragement and positive affirmations
- Help identify patterns in mood and suggest improvements
- Recommend exercises and activities based on emotional state

Your personality:
- Warm, caring, and non-judgmental
- Patient and understanding
- Supportive but not preachy
- Use a conversational, friendly tone
- Occasionally use relevant emojis to convey warmth

Important guidelines:
- You are NOT a replacement for professional mental health care
- If someone expresses thoughts of self-harm or suicide, immediately provide crisis resources:
  * National Suicide Prevention Lifeline: 988 (US)
  * Crisis Text Line: Text HOME to 741741
  * International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/
- Encourage professional help when issues seem beyond casual support
- Never diagnose conditions or prescribe treatments
- Keep responses concise but meaningful (2-4 paragraphs max)
- Ask follow-up questions to understand the user better

Remember: You have access to the user's recent moods and journal entries to provide personalized support.`;

// @desc    Send message to AI and get response
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message is required" });
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: "OpenAI API key not configured" });
    }

    // Get user's recent context (last 7 days of moods and recent journals)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentMoods, recentJournals] = await Promise.all([
      Mood.find({ 
        user: req.user.id, 
        createdAt: { $gte: sevenDaysAgo } 
      }).sort({ createdAt: -1 }).limit(7),
      Journal.find({ user: req.user.id })
        .populate("entry")
        .sort({ createdAt: -1 })
        .limit(3)
    ]);

    // Build context about user
    let userContext = "";
    
    if (recentMoods.length > 0) {
      const moodSummary = recentMoods.map(m => 
        `${new Date(m.createdAt).toLocaleDateString()}: ${m.moodType}`
      ).join(", ");
      userContext += `\n\nUser's recent moods (last 7 days): ${moodSummary}`;
      
      // Analyze mood pattern
      const moodCounts = {};
      recentMoods.forEach(m => {
        moodCounts[m.moodType] = (moodCounts[m.moodType] || 0) + 1;
      });
      const dominantMood = Object.entries(moodCounts)
        .sort((a, b) => b[1] - a[1])[0];
      if (dominantMood) {
        userContext += `\nDominant mood this week: ${dominantMood[0]}`;
      }
    }

    if (recentJournals.length > 0) {
      const journalTitles = recentJournals
        .filter(j => j.entry)
        .map(j => j.entry.title)
        .join(", ");
      if (journalTitles) {
        userContext += `\nRecent journal topics: ${journalTitles}`;
      }
    }

    // Find or create chat session
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: req.user.id });
    }
    
    if (!chat) {
      chat = await Chat.create({
        user: req.user.id,
        messages: []
      });
    }

    // Add user message to chat
    chat.messages.push({
      role: "user",
      content: message
    });

    // Prepare messages for OpenAI
    const systemMessage = SYSTEM_PROMPT + userContext;
    
    // Get last 10 messages for context (to avoid token limits)
    const recentMessages = chat.messages.slice(-10);
    
    const openaiMessages = [
      { role: "system", content: systemMessage },
      ...recentMessages.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: openaiMessages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.6,
        frequency_penalty: 0.5
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("OpenAI API error:", errorData);
      return res.status(500).json({ message: "Failed to get AI response" });
    }

    const openaiData = await openaiResponse.json();
    const assistantMessage = openaiData.choices[0]?.message?.content;

    if (!assistantMessage) {
      return res.status(500).json({ message: "No response from AI" });
    }

    // Add assistant message to chat
    chat.messages.push({
      role: "assistant",
      content: assistantMessage
    });

    // Update chat title based on first user message
    if (chat.messages.filter(m => m.role === "user").length === 1) {
      chat.title = message.substring(0, 50) + (message.length > 50 ? "..." : "");
    }

    await chat.save();

    res.status(200).json({
      success: true,
      data: {
        chatId: chat._id,
        message: {
          role: "assistant",
          content: assistantMessage,
          timestamp: new Date()
        }
      }
    });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/:chatId
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ 
      _id: req.params.chatId, 
      user: req.user.id 
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({
      success: true,
      data: chat
    });

  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all user's chat sessions
// @route   GET /api/chat
// @access  Private
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id })
      .select("title createdAt updatedAt")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });

  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Start new chat session
// @route   POST /api/chat/new
// @access  Private
export const createNewChat = async (req, res) => {
  try {
    const chat = await Chat.create({
      user: req.user.id,
      messages: [{
        role: "assistant",
        content: "Hello! 👋 I'm MindBot, your wellness companion. I'm here to listen, support, and help you navigate your thoughts and feelings. How are you doing today?"
      }]
    });

    res.status(201).json({
      success: true,
      data: chat
    });

  } catch (error) {
    console.error("Create chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete chat session
// @route   DELETE /api/chat/:chatId
// @access  Private
export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ 
      _id: req.params.chatId, 
      user: req.user.id 
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({
      success: true,
      message: "Chat deleted"
    });

  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Clear all messages in a chat
// @route   DELETE /api/chat/:chatId/messages
// @access  Private
export const clearChatMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({ 
      _id: req.params.chatId, 
      user: req.user.id 
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    chat.messages = [{
      role: "assistant",
      content: "Chat cleared! 🌟 I'm still here whenever you need to talk. How can I help you today?"
    }];
    await chat.save();

    res.status(200).json({
      success: true,
      data: chat
    });

  } catch (error) {
    console.error("Clear chat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
