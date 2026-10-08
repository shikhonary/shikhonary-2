import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

/**
 * Returns the active AI model instance based on environment configuration.
 * Supports OpenRouter, Google Gemini, and Groq.
 */
export function getAssistantModel(): LanguageModel {
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  const googleApiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  const provider = (
    process.env.AI_PROVIDER ||
    (openrouterApiKey ? "openrouter" : googleApiKey ? "google" : "groq")
  ).toLowerCase();

  // 1. OpenRouter Provider (Free tier models)
  if (provider === "openrouter") {
    if (!openrouterApiKey || openrouterApiKey.trim() === "") {
      throw new Error(
        "OPENROUTER_API_KEY is not configured. Please set your OpenRouter API key in apps/tenant/.env."
      );
    }

    const openrouter = createOpenRouter({ apiKey: openrouterApiKey });
    const modelName = process.env.AI_MODEL || "openrouter/free";
    return openrouter(modelName);
  }

  // 2. Google Gemini Provider
  if (provider === "google") {
    if (!googleApiKey || googleApiKey.trim() === "") {
      throw new Error(
        "GOOGLE_GENERATIVE_AI_API_KEY is not configured. Please set your Gemini API key in apps/tenant/.env."
      );
    }

    const google = createGoogleGenerativeAI({ apiKey: googleApiKey });
    const modelName = process.env.AI_MODEL || "gemini-flash-latest";
    return google(modelName);
  }

  // 3. Groq Provider Fallback
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey || groqApiKey.trim() === "") {
    throw new Error(
      "GROQ_API_KEY is not configured. Please set your GROQ_API_KEY in apps/tenant/.env to use the AI assistant."
    );
  }

  const groq = createGroq({ apiKey: groqApiKey });
  const modelName = process.env.AI_MODEL || "llama-3.3-70b-versatile";
  return groq(modelName);
}

// Backwards-compatible alias for existing imports
export const getGroqModel = getAssistantModel;

