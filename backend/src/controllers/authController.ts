// src/controllers/authController.ts
// MVC Controller: translates HTTP requests into service calls and shapes responses.
import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { Role } from '../models';

export const authController = {
  login(req: Request, res: Response): void {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    try {
      res.json(authService.login(email, password));
    } catch (err) {
      res.status(401).json({ error: (err as Error).message });
    }
  },

  register(req: Request, res: Response): void {
    const { name, email, password, role } = req.body ?? {};
    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'name, email, password, and role are required' });
      return;
    }
    if (role !== 'lecturer' && role !== 'student') {
      res.status(400).json({ error: 'role must be lecturer or student' });
      return;
    }
    try {
      res.status(201).json(authService.register(name, email, password, role as Role));
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },

  me(req: Request, res: Response): void {
    res.json({ user: req.user });
  },
};