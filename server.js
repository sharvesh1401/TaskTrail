import express from 'express';
import cors from 'cors';
import groqHandler from './api/groq.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Convert the Vercel-style handler to Express middleware
app.all('/api/groq', async (req, res) => {
  try {
    await groqHandler(req, res);
  } catch (error) {
    console.error('Error in groq handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});