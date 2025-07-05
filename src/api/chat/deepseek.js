// DeepSeek API service module
// Handles sending requests to the DeepSeek API using configured URL and Key.

import dotenv from "dotenv";
dotenv.config(); // For local development, loads .env file variables into process.env

// Required environment variables:
// process.env.DEEPSEEK_API_URL: The full URL for the DeepSeek chat completions endpoint.
//                               Example: https://api.deepseek.com/v1/chat/completions
// process.env.DEEPSEEK_API_KEY: Your DeepSeek API key.

export async function sendToDeepSeek(payload) {
  const url = process.env.DEEPSEEK_API_URL;
  const key = process.env.DEEPSEEK_API_KEY;

  if (!url) {
    console.error("❌ DeepSeek error: DEEPSEEK_API_URL is not defined in environment variables.");
    throw new Error("DeepSeek API URL is not configured.");
  }
  if (!key) {
    console.error("❌ DeepSeek error: DEEPSEEK_API_KEY is not defined in environment variables.");
    throw new Error("DeepSeek API Key is not configured.");
  }

  console.log(`Attempting DeepSeek API call to: ${url} with payload:`, JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify(payload) // Assuming payload is the entire body for DeepSeek
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ DeepSeek API request failed: ${res.status} ${res.statusText}. Response: ${text}`);
      throw new Error(`DeepSeek API ${res.status}: ${text}`);
    }

    // Similar to Groq, the prompt expects `data.reply`.
    // Adding robust handling for OpenAI-compatible structure as a fallback.
    const data = await res.json();
    console.log("DeepSeek API raw response data:", JSON.stringify(data, null, 2));

    if (data && data.reply) {
        return data.reply;
    } else if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        console.warn("⚠️ DeepSeek response did not have a 'reply' field, but found OpenAI-compatible structure. Using `choices[0].message.content`.");
        return data.choices[0].message.content; // Fallback to typical OpenAI structure
    } else {
        console.error("❌ DeepSeek error: Response JSON did not contain a 'reply' field or expected OpenAI structure.");
        throw new Error("DeepSeek API response did not contain a 'reply' field or expected OpenAI structure.");
    }

  } catch (err) {
    // Log the error regardless of whether it's a new Error thrown above or a network error from fetch
    if (!(err.message && err.message.startsWith('DeepSeek API'))) { // Avoid double logging
        console.error("❌ DeepSeek error during fetch or JSON parsing:", err);
    }
    throw err; // Re-throw the error to be caught by the calling function in api/chat.js
  }
}
