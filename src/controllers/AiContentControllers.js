import { GoogleGenAI } from "@google/genai";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const generateAiContent = asyncHandler(async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    throw new ApiError(400, "Topic is required");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, "GEMINI_API_KEY not set in environment");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Write short 2–3 lines about: ${topic}. Keep it crisp and latest.`;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  const content = result.text;  // Fixed: No () here!

  return res
    .status(200)
    .json(new ApiResponse(200, { content }, "AI short content generated"));
});