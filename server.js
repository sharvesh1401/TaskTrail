import express from 'express';
import cors from 'cors';
import { handler as aiChatHandler } from './api/ai-chat.js';
import { handler as groqHandler } from './api/groq.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Handle the new AI chat endpoint with fallback support
app.post('/api/ai-chat', async (req, res) => {
  try {
    // Create a mock Vercel request/response object for the handler
    const mockReq = {
      method: 'POST',
      body: req.body,
      headers: req.headers
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => res.status(code).json(data),
        end: () => res.status(code).end()
      }),
      json: (data) => res.json(data),
      setHeader: (name, value) => res.setHeader(name, value)
    };
    
    await aiChatHandler(mockReq, mockRes);
  } catch (error) {
    console.error('AI Chat API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle the legacy groq API endpoint
app.post('/api/groq', async (req, res) => {
  try {
    // Create a mock Vercel request/response object for the handler
    const mockReq = {
      method: 'POST',
      body: req.body,
      headers: req.headers
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => res.status(code).json(data),
        end: () => res.status(code).end()
      }),
      json: (data) => res.json(data),
      setHeader: (name, value) => res.setHeader(name, value)
    };
    
    await groqHandler(mockReq, mockRes);
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('TaskTrail Backend server is running with AI fallback support.');
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
  console.log('AI Chat endpoint: /api/ai-chat (with Groq + DeepSeek fallback)');
  console.log('Legacy Groq endpoint: /api/groq');
});