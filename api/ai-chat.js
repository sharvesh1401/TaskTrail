export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
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
        console.log('Attempting Groq API...');
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
            console.log(`Groq API request failed with status: ${groqResponse.status} ${groqResponse.statusText}. Response body: ${errorBody}`);
          }
        } else {
          // This case should ideally not be hit if groqResponse.ok is false, but added for completeness
          console.log('Groq API response was not ok (unexpected). Status:', groqResponse.status, groqResponse.statusText);
        }
      } catch (error) {
        console.error('Detailed Groq API fetch/processing error:', error); // Log the full error object
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        if (error.cause) console.log('Error cause:', error.cause);
      }
    }

    // Fallback to DeepSeek if Groq failed
    if (!aiResponse && deepseekApiKey) {
      const deepseekApiUrl = 'https://api.deepseek.com/v1/chat/completions';
      try {
        console.log(`Attempting DeepSeek API call to: ${deepseekApiUrl}`);
        const deepseekResponse = await fetch(deepseekApiUrl, {
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
           console.log(`DeepSeek API request failed with status: ${deepseekResponse.status} ${deepseekResponse.statusText}. Response body: ${errorBody}`);
        }
      } catch (error) {
        console.error('Detailed DeepSeek API fetch/processing error:', error); // Log the full error object
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        if (error.cause) console.log('Error cause:', error.cause);
      }
    }

    if (!aiResponse) {
      console.error('Both AI providers failed');
      res.status(500).json({ error: 'AI services temporarily unavailable' });
      return;
    }

    res.status(200).json({ 
      response: aiResponse,
      provider: usedProvider
    });

  } catch (error) {
    console.error('AI Chat handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export { handler }