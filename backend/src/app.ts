// src/app.ts
import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import moduleRoutes from './routes/moduleRoutes';
import sessionRoutes from './routes/sessionRoutes';
import studentRoutes from './routes/studentRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Quota API', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/student', studentRoutes);

export default app;