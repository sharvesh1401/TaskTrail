// Unified Chat API Endpoint (/api/chat.ts)
// Handles chat requests, proxies to AI services (Groq with DeepSeek fallback),
// and manages environment variable configurations.

// --- Environment Variables Required ---
// Create a .env file in the project root for local development (and ensure it's in .gitignore).
// For deployment (Vercel, Netlify, etc.), set these in your hosting platform's environment variable settings.
//
// GROQ_API_URL:         URL for the Groq API chat completions endpoint.
//                       Example: https://api.groq.com/openai/v1/chat/completions
// GROQ_API_KEY:         Your API key for Groq.
// GROQ_MODEL_NAME:      (Optional) Specific Groq model to use. Defaults to 'llama3-8b-8192'.
//                       Example: mixtral-8x7b-32768
//
// DEEPSEEK_API_URL:     URL for the DeepSeek API chat completions endpoint.
//                       Example: https://api.deepseek.com/v1/chat/completions
// DEEPSEEK_API_KEY:     Your API key for DeepSeek.
// DEEPSEEK_MODEL_NAME:  (Optional) Specific DeepSeek model to use. Defaults to 'deepseek-chat'.
//
// Example .env file:
// GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
// GROQ_API_KEY=your_groq_key_here
// # GROQ_MODEL_NAME=mixtral-8x7b-32768
// DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
// DEEPSEEK_API_KEY=your_deepseek_key_here
// # DEEPSEEK_MODEL_NAME=deepseek-coder
// ---

import { NextApiRequest, NextApiResponse } from "next"; // Or appropriate types for your server framework
import dotenv from "dotenv";
dotenv.config();

// Helper function to proxy requests to an AI service
async function proxyToService(url: string, key: string, payload: any): Promise<any> {
  // Ensure payload is structured as expected by typical OpenAI-compatible APIs
  // The frontend sends: { systemPrompt, tasksContext, conversation, userMessage }
  // This needs to be transformed into the { model, messages, ... } structure.
  // For this generic proxy, we'll assume the payload received IS ALREADY the body
  // expected by the downstream service, or that the downstream service
  // can handle the raw payload from Chatbox.tsx.
  // The prompt for this step has `body: JSON.stringify(payload)` where payload is `req.body`.
  // This means whatever `Chatbox.tsx` sends as `req.body` will be forwarded.
  // Let's assume the `payload` argument here is what `Chatbox.tsx` constructs.
  // The AI services (Groq, Deepseek) expect a body like:
  // {
  //   "messages": [
  //     { "role": "system", "content": payload.systemPrompt },
  //     // ... other messages from payload.conversation and payload.userMessage
  //   ],
  //   "model": "model-name" // Model name might need to be configured or passed in payload
  // }
  // The user's prompt for this specific API route just passes `payload` (req.body) through.
  // This implies the `payload` from `req.body` must already be in the format the AI services expect.
  // Let's log what `payload` contains here to be sure.
  console.log(`Proxying to ${url}. Payload received by proxyToService:`, JSON.stringify(payload, null, 2));

  // Extract messages for the AI service from the incoming payload
  const messagesForAI = [];
  if (payload.systemPrompt) {
    messagesForAI.push({ role: "system", content: payload.systemPrompt });
  }
  // Add task context as a system message if present and non-empty
  if (payload.tasksContext && payload.tasksContext.length > 0) {
      messagesForAI.push({
        role: 'system',
        content: `User's current tasks for context: ${JSON.stringify(payload.tasksContext)}`
      });
  }
  if (payload.conversation && Array.isArray(payload.conversation)) {
    messagesForAI.push(...payload.conversation);
  }
  messagesForAI.push({ role: "user", content: payload.userMessage });

  // Determine model based on URL or add as a configurable env var later if needed
  let modelName;
  if (url.includes("groq")) {
    modelName = process.env.GROQ_MODEL_NAME || "llama3-8b-8192"; // Example Groq model
  } else if (url.includes("deepseek")) {
    modelName = process.env.DEEPSEEK_MODEL_NAME || "deepseek-chat"; // Example Deepseek model
  } else {
    modelName = "default-model"; // Fallback or make this an error
  }

  const servicePayload = {
    messages: messagesForAI,
    model: modelName,
    // Add other common parameters, configurable if necessary
    temperature: 0.7,
    max_tokens: 300, // As used in previous examples from user
    top_p: 1,
    stream: false
  };

  console.log(`Payload being sent to AI service (${url}):`, JSON.stringify(servicePayload, null, 2));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify(servicePayload), // Send the transformed payload
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Service ${url} returned ${res.status}. Response: ${errorText}`);
    throw new Error(`Service ${url} returned ${res.status}`);
  }
  // The response from Groq/Deepseek (if OpenAI compatible) is { choices: [{ message: { content: "..."}}]}
  // The prompt asks for `groq.reply` or `ds.reply`. This means the `proxyToService`
  // should extract the actual message content and return it in a consistent way, perhaps as the whole JSON.
  // The handler then does `res.status(200).json({ reply: groq.reply });`
  // This implies `proxyToService` should return an object that has a `reply` key.
  // Let's make `proxyToService` return the AI's message content under the key 'reply'.
  const jsonResponse = await res.json();
  console.log(`Raw JSON response from ${url}:`, JSON.stringify(jsonResponse, null, 2));

  if (jsonResponse && jsonResponse.choices && jsonResponse.choices[0] && jsonResponse.choices[0].message && jsonResponse.choices[0].message.content) {
    return { reply: jsonResponse.choices[0].message.content, providerResponse: jsonResponse };
  } else if (jsonResponse && jsonResponse.reply) { // If the service *already* returns a 'reply' field
    return { reply: jsonResponse.reply, providerResponse: jsonResponse };
  } else {
    console.error(`Unexpected response structure from ${url}:`, jsonResponse);
    throw new Error(`Unexpected response structure from ${url}.`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Be more specific in production
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const payload = req.body; // This is what Chatbox.tsx sends

  if (!payload || !payload.userMessage) {
    return res.status(400).json({ error: "Request body must include at least a userMessage." });
  }

  // Ensure API URLs and Keys are loaded and available
  const groqApiUrl = process.env.GROQ_API_URL;
  const groqApiKey = process.env.GROQ_API_KEY;
  const deepseekApiUrl = process.env.DEEPSEEK_API_URL;
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

  let groqErrorMessage: string | null = null; // To store Groq error message if it occurs

  if (!groqApiUrl || !groqApiKey) {
    console.error("❌ Groq API URL or Key is not configured in environment variables.");
    groqErrorMessage = "Groq API not configured.";
    // Fallback directly if primary is not configured
  } else {
    try {
      // Primary: Groq
      console.log("Attempting Groq service...");
      const groqResponseObj = await proxyToService(
        groqApiUrl,
        groqApiKey,
        payload // Pass the original payload from Chatbox.tsx
      );
      console.log("Groq service successful.");
      return res.status(200).json({ reply: groqResponseObj.reply, provider: "Groq" });
    } catch (err) {
      const groqErr = err as Error; // Type assertion
      console.warn("⚠️ Groq failed:", groqErr.message);
      groqErrorMessage = groqErr.message; // Store Groq error message
      // Fall through to DeepSeek.
    }
  }

  // Fallback: DeepSeek
  if (!deepseekApiUrl || !deepseekApiKey) {
    console.error("❌ DeepSeek API URL or Key is not configured. Cannot fallback.");
    // Log both reasons if Groq also had an issue
    if (groqErrorMessage) {
        console.error(`Original Groq issue: ${groqErrorMessage}`);
    }
    return res.status(502).json({ error: "All AI services are currently unavailable (config error)." });
  }

  try {
    console.log("Attempting DeepSeek service (fallback)...");
    const dsResponseObj = await proxyToService(
      deepseekApiUrl,
      deepseekApiKey,
      payload // Pass the original payload from Chatbox.tsx
    );
    console.log("DeepSeek service successful (fallback).");
    // The prompt is: res.status(200).json({ reply: ds.reply ?? ds });
    // My proxyToService returns an object like { reply: "content", providerResponse: ... }
    return res.status(200).json({ reply: dsResponseObj.reply, provider: "DeepSeek" });
  } catch (dsErr) {
    // This dsErr is from proxyToService if it threw an error during the DeepSeek attempt.
    // groqErr is not directly in scope here but its message was logged if it occurred.
    // For the final error, we need to access the original groqErr if it happened.
    // This requires restructuring slightly or passing groqErr's message.
    // For simplicity and following the prompt's final error structure,
    // we'll log the messages we have.

    // To include groqErr.message in the final log as per prompt, it must be available.
    // Let's assume groqErr from the previous catch block is accessible or its message is stored.
    // However, standard try-catch scoping won't make groqErr available here.
    // The prompt shows: console.error("❌ Both AI providers failed:", { groq: groqErr.message, deepseek: dsErr.message });
    // This implies groqErr should be accessible. Let's declare it outside.

    // Re-evaluating based on current structure: groqErr is out of scope.
    // The console.warn for Groq failure already logged groqErrorMessage if it occurred.
    console.error("❌ Both AI providers failed:", {
        groq: groqErrorMessage || "Groq not attempted or succeeded but error in DeepSeek path (should not happen).", // Provide stored Groq error
        deepseek: dsErr.message,
      });
    console.error("DeepSeek Full Error Object (if DeepSeek was attempted):", dsErr);

    // Ensure the final response is always JSON as per user request.
    return res.status(502).json({ error: "All AI services are unavailable." });
  }
}
