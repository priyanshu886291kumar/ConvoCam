import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const router = express.Router();

router.post("/", async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: "Text and targetLang are required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return res.json({ translated: `[${targetLang.toUpperCase()}]: ${text}` });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    } catch {
      model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    const prompt = `Translate the following text accurately and naturally to ${targetLang}. Return only the translated text without explanations, notes, or quotes:\n"${text}"`;

    const result = await model.generateContent(prompt);
    const translatedText = result.response.text();

    res.json({ translated: translatedText.trim().replace(/^["']|["']$/g, "") });
  } catch (error) {
    console.warn("Gemini translation notice:", error.message);
    res.json({ translated: `[${targetLang.toUpperCase()}]: ${text}` });
  }
});

export default router;
