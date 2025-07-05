// Unified chat endpoint
// Handles requests from the frontend, calls AI service modules (Groq, then DeepSeek as fallback),
// and returns the AI response or an error.

// Required Environment Variables for AI services (set in .env for local, and in hosting platform for deployment):
// GROQ_API_URL: URL for the Groq API chat completions endpoint.
// GROQ_API_KEY: Your API key for Groq.
// DEEPSEEK_API_URL: URL for the DeepSeek API chat completions endpoint.
// DEEPSEEK_API_KEY: Your API key for DeepSeek.
// Example .env content:
// GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
// GROQ_API_KEY=your_groq_api_key_here
// DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
// DEEPSEEK_API_KEY=your_deepseek_api_key_here

import { sendToGroq } from "../src/api/chat/groq.js";
import { sendToDeepSeek } from "../src/api/chat/deepseek.js";

// This default export is typical for serverless functions (e.g., Vercel, Netlify, Next.js API routes)
export default async function handler(req, res) {
  // Enable CORS - adjust origin for production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // The prompt assumes req.body is already parsed.
  // In a raw Node.js http server, you'd need to parse it.
  // For frameworks like Next.js/Express, it's usually pre-parsed.
  // For Vercel serverless functions, it's also typically pre-parsed.
  const payload = req.body;

  if (!payload || Object.keys(payload).length === 0) {
    console.warn("⚠️ /api/chat received empty or undefined payload.");
    return res.status(400).json({ error: "Request body is missing or empty." });
  }

  console.log("Unified /api/chat endpoint received payload:", JSON.stringify(payload, null, 2));

  try {
    // First attempt Groq
    console.log("Attempting Groq via unified /api/chat endpoint...");
    const reply = await sendToGroq(payload);
    console.log("Groq call successful via /api/chat.");
    return res.status(200).json({ reply: reply, provider: "Groq" }); // Added provider info
  } catch (groqErr) {
    console.warn(`🏁 Groq failed in /api/chat (Error: ${groqErr.message}). Falling back to DeepSeek.`);
    try {
      console.log("Attempting DeepSeek via unified /api/chat endpoint (fallback)...");
      const reply = await sendToDeepSeek(payload);
      console.log("DeepSeek call successful via /api/chat (fallback).");
      return res.status(200).json({ reply: reply, provider: "DeepSeek" }); // Added provider info
    } catch (deepErr) {
      console.error(`❌ Both AI providers failed in /api/chat. Groq Error: ${groqErr.message}, DeepSeek Error: ${deepErr.message}`);
      // Log the full errors if they are custom error objects, or just messages if they are strings
      console.error("Groq Full Error Object:", groqErr);
      console.error("DeepSeek Full Error Object:", deepErr);
      return res.status(502).json({ error: "All AI services are currently unavailable." });
    }
  }
}
