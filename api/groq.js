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

    // Get API key from environment
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('GROQ_API_KEY not found in environment variables');
      res.status(500).json({ error: 'API configuration error' });
      return;
    }

    // Build messages array for Groq API
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

    // Call Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', groqResponse.status, groqResponse.statusText, errorText);
      res.status(500).json({ error: 'Failed to get AI response' });
      return;
    }

    const data = await groqResponse.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Groq API response format:', data);
      res.status(500).json({ error: 'Invalid AI response format' });
      return;
    }

    const aiResponse = data.choices[0].message.content;

    res.status(200).json({
      response: aiResponse,
      usage: data.usage
    });

  } catch (error) {
    console.error('Groq API handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}