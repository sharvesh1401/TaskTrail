import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

// Define default API endpoint URLs, allowing override via environment variables
const DEFAULT_GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const groqServiceUrl = process.env.GROQ_API_ENDPOINT_URL || DEFAULT_GROQ_API_URL;
const deepseekServiceUrl = process.env.DEEPSEEK_API_ENDPOINT_URL || DEFAULT_DEEPSEEK_API_URL;


export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // Be more specific in production
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { systemPrompt, tasksContext, conversation, userMessage } = req.body;

    if (!userMessage) {
      res.status(400).json({ error: 'User message is required' });
      return;
    }

    // Get API keys from environment
    const groqApiKey = process.env.GROQ_API_KEY;
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

    if (!groqApiKey && !deepseekApiKey) {
      console.error('No AI API keys found in environment variables');
      res.status(500).json({ error: 'AI service configuration error' });
      return;
    }

    // Build messages array for AI APIs
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add task context if provided
    if (tasksContext && tasksContext.length > 0) {
      messages.push({
        role: 'system',
        content: `Current tasks: ${tasksContext.map(task => 
          `"${task.title}" (${task.importance} priority, ${task.status}${task.goal ? `, goal: ${task.goal}` : ''})`
        ).join(', ')}`
      });
    }

    // Add conversation history
    if (conversation && conversation.length > 0) {
      messages.push(...conversation.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    // Try Groq first, then fallback to DeepSeek
    let aiResponse = null;
    let usedProvider = null;

    // Attempt Groq API first
    if (groqApiKey) {
      try {
        console.log(`Attempting Groq API call to: ${groqServiceUrl}`);
        const groqResponse = await fetch(groqServiceUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-70b-versatile',
            messages: messages,
            temperature: 0.7,
            max_tokens: 300,
            top_p: 1,
            stream: false
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          if (data.choices && data.choices[0] && data.choices[0].message) {
            aiResponse = data.choices[0].message.content;
            usedProvider = 'Groq';
            console.log('Groq API successful');
          } else {
            // Log more details if response is not ok
            const errorBody = await groqResponse.text();
            console.log(`Groq API request failed: ${groqResponse.status} ${groqResponse.statusText}. Response body: ${errorBody}`);
            // No explicit throw here, as per original logic, it just means aiResponse remains null
          }
        } // No 'else' needed here as per original logic for non-ok responses
      } catch (error) {
        console.error("❌ Groq API attempt in /api/ai-chat error:", error);
        // aiResponse remains null, will fall through to DeepSeek or final error
      }
    }

    // Fallback to DeepSeek if Groq failed
    if (!aiResponse && deepseekApiKey) {
      try {
        console.log(`Attempting DeepSeek API call to: ${deepseekServiceUrl}`);
        const deepseekResponse = await fetch(deepseekServiceUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${deepseekApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: messages,
            temperature: 0.7,
            max_tokens: 300,
            top_p: 1,
            stream: false
          }),
        });

        if (deepseekResponse.ok) {
          const data = await deepseekResponse.json();
          if (data.choices && data.choices[0] && data.choices[0].message) {
            aiResponse = data.choices[0].message.content;
            usedProvider = 'DeepSeek';
            console.log('DeepSeek API successful');
          } else {
            console.log('DeepSeek API response ok, but data format unexpected:', data);
          }
        } else {
           // Log more details if response is not ok
           const errorBody = await deepseekResponse.text();
           console.log(`DeepSeek API request failed: ${deepseekResponse.status} ${deepseekResponse.statusText}. Response body: ${errorBody}`);
           // No explicit throw here, will fall through to final error
        }
      } catch (error) {
        console.error("❌ DeepSeek API attempt in /api/ai-chat error:", error);
        // aiResponse remains null, will fall through to final error
      }
    }

    if (!aiResponse) {
      console.error('❌ Both AI providers failed or no AI response obtained in /api/ai-chat.');
      // Ensure a 500 status for the client as per user instruction for this case
      return res.status(500).json({ error: "Chat service unavailable." });
    }

    // Success case
    return res.status(200).json({
      response: aiResponse,
      provider: usedProvider
    });

  } catch (error) {
    // General catch-all for unexpected errors in the handler itself
    console.error('❌ Unexpected error in /api/ai-chat handler:', error);
    return res.status(500).json({ error: "Chat service encountered an internal error." });
  }
}

// export { handler } // Original export, ensure this is correct for your server setup
// If this is a Vercel-like serverless function, 'export default async function handler...' is enough.
// If it's part of an Express app, this export might be used differently.
// For now, assuming the default export is the primary way it's invoked.