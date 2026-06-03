// src/app.ts
import 'dotenv/config';                 // load environment variables before anything else
import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Quota API', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);

export default app;