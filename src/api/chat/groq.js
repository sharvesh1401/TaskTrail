// Groq API service module
// Handles sending requests to the Groq API using configured URL and Key.

import dotenv from "dotenv";
dotenv.config(); // For local development, loads .env file variables into process.env

// Required environment variables:
// process.env.GROQ_API_URL: The full URL for the Groq chat completions endpoint.
//                           Example: https://api.groq.com/openai/v1/chat/completions
// process.env.GROQ_API_KEY: Your Groq API key.

export async function sendToGroq(payload) {
  const url = process.env.GROQ_API_URL;
  const key = process.env.GROQ_API_KEY;

  if (!url) {
    console.error("❌ Groq error: GROQ_API_URL is not defined in environment variables.");
    throw new Error("Groq API URL is not configured.");
  }
  if (!key) {
    console.error("❌ Groq error: GROQ_API_KEY is not defined in environment variables.");
    throw new Error("Groq API Key is not configured.");
  }

  console.log(`Attempting Groq API call to: ${url} with payload:`, JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify(payload) // The payload here is the entire body for Groq
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ Groq API request failed: ${res.status} ${res.statusText}. Response: ${text}`);
      throw new Error(`Groq API ${res.status}: ${text}`);
    }

    // Assuming Groq response structure includes a 'reply' or similar field.
    // The prompt example used `const { reply } = await res.json();`
    // However, typical OpenAI-compatible responses are like: data.choices[0].message.content
    // I will stick to the prompt's expectation of `data.reply` for now,
    // but this might need adjustment based on actual Groq response structure.
    // Let's assume the payload sent to this function is what Groq expects in its body,
    // and the actual AI message to be extracted is in `data.choices[0].message.content`.
    // The prompt asks for `const { reply } = await res.json(); return reply;`
    // This implies the Groq service itself is expected to return a JSON with a top-level "reply" field.
    // This is unusual for OpenAI-compatible APIs.
    // I will assume for now the user wants to extract 'reply' from the JSON response from `process.env.GROQ_API_URL`.
    // If `process.env.GROQ_API_URL` points to an OpenAI-compatible Groq endpoint, the response would be different.
    // The prompt specifies: `const { reply } = await res.json(); return reply;`
    // I will follow this, but add a log for the full JSON to help debug if 'reply' is not found.

    const data = await res.json();
    console.log("Groq API raw response data:", JSON.stringify(data, null, 2));

    if (data && data.reply) {
        return data.reply;
    } else if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        console.warn("⚠️ Groq response did not have a 'reply' field, but found OpenAI-compatible structure. Using `choices[0].message.content`.");
        return data.choices[0].message.content; // Fallback to typical OpenAI structure
    } else {
        console.error("❌ Groq error: Response JSON did not contain a 'reply' field or expected OpenAI structure.");
        throw new Error("Groq API response did not contain a 'reply' field or expected OpenAI structure.");
    }

  } catch (err) {
    // Log the error regardless of whether it's a new Error thrown above or a network error from fetch
    if (!(err.message && err.message.startsWith('Groq API'))) { // Avoid double logging for errors already logged
        console.error("❌ Groq error during fetch or JSON parsing:", err);
    }
    throw err; // Re-throw the error to be caught by the calling function in api/chat.js
  }
}
