import express from 'express';
import cors from 'cors';
import { handler as groqHandler } from './api/groq.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Handle the groq API endpoint
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
        json: (data) => res.status(code).json(data)
      }),
      json: (data) => res.json(data)
    };
    
    await groqHandler(mockReq, mockRes);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Backend server is running.');
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});