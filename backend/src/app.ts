// src/app.ts
// Presentation-layer entry point. Builds the Express app and mounts routes.
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());            // allow the Expo app to call this API
app.use(express.json());    // parse JSON request bodies

// Health check — confirms the API is alive (real routes come later)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Quota API', time: new Date().toISOString() });
});

export default app;