import dotenv from "dotenv";
dotenv.config();

export async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  // Set CORS headers for the actual request
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  try {
    const { systemPrompt, tasksContext, conversation, userMessage } = req.body;

    if (!userMessage) {
      res.status(400).json({ error: 'User message is required' });
      return;
    }

    // Get API configuration from environment
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    
    if (!apiKey) {
      console.error('❌ DEEPSEEK_API_KEY not found in environment variables');
      res.status(500).json({ error: 'API configuration error' });
      return;
    }

    // Build messages array for DeepSeek API
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

    console.log(`🚀 Calling DeepSeek API at: ${apiUrl}`);

    // Call DeepSeek API
    const deepseekResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('❌ DeepSeek API error:', deepseekResponse.status, deepseekResponse.statusText, errorText);
      res.status(500).json({ error: 'Failed to get AI response' });
      return;
    }

    const data = await deepseekResponse.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid DeepSeek API response format:', data);
      res.status(500).json({ error: 'Invalid AI response format' });
      return;
    }

    const aiResponse = data.choices[0].message.content;
    console.log('✅ DeepSeek API successful');

    res.status(200).json({
      reply: aiResponse,
      usage: data.usage
    });

  } catch (error) {
    console.error('❌ DeepSeek API handler error:', error);
    res.status(500).json({ error: 'AI service unavailable.' });
  }
}