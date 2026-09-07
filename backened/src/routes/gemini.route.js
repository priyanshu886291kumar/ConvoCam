import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const router = express.Router();

// Helper for contextual fallback replies if Gemini API is unavailable or unconfigured
const getFallbackReplies = (message = "") => {
  const lower = message.toLowerCase().trim();

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("hola") || lower.includes("namaste")) {
    return ["Hey! How are you doing?", "Hello! Great to hear from you 😊", "Hi there! How's your day going?"];
  }
  if (lower.includes("how are you") || lower.includes("how r u") || lower.includes("what's up") || lower.includes("sup")) {
    return ["I'm doing well, thanks! How about you?", "Everything is going great! 😊", "Pretty good! What have you been up to?"];
  }
  if (lower.includes("?") || lower.startsWith("what") || lower.startsWith("where") || lower.startsWith("when") || lower.startsWith("why") || lower.startsWith("can you")) {
    return ["Yes, absolutely!", "I'm not sure yet, tell me more.", "Sure, let me check and let you know!"];
  }
  if (lower.includes("thank") || lower.includes("thx") || lower.includes("appreciate")) {
    return ["You're welcome!", "Anytime! Happy to help 😊", "No problem at all!"];
  }
  if (lower.includes("bye") || lower.includes("see you") || lower.includes("good night")) {
    return ["See you later! Take care 👋", "Talk to you soon!", "Have a wonderful day!"];
  }

  return ["Sounds great!", "Tell me more about it 😊", "I agree with you!"];
};

router.post("/suggest-replies", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Message is required" });

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    // Return intelligent contextual fallback replies
    return res.json({ suggestions: getFallbackReplies(message) });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Try gemini-1.5-flash first, fallback to gemini-2.0-flash
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    } catch {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    const prompt = `You are an AI assistant for a friendly language exchange chat app. Give exactly 3 short, natural, conversational reply suggestions (maximum 1 sentence each) to this message: "${message}". Format: return each reply on a separate line without numbers or bullet points.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const suggestions = text
      .split("\n")
      .map((line) => line.replace(/^[\d\.\-\*\•\s]+/, "").trim())
      .filter((line) => line.length > 0 && line.length < 120)
      .slice(0, 3);

    if (suggestions.length > 0) {
      return res.json({ suggestions });
    }

    return res.json({ suggestions: getFallbackReplies(message) });
  } catch (error) {
    console.warn("Gemini API suggestion notice:", error.message);
    // Graceful fallback to contextual replies
    return res.json({ suggestions: getFallbackReplies(message) });
  }
});

export default router;