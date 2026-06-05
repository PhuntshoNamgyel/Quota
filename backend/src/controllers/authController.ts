// src/controllers/authController.ts
import { Request, Response } from 'express';
import { authService } from '../services/authService';

// At least 8 characters, one uppercase, one lowercase, one digit
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

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

  changePassword(req: Request, res: Response): void {
    const { currentPassword, newPassword } = req.body ?? {};
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'currentPassword and newPassword are required' });
      return;
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      res.status(400).json({ error: 'New password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number' });
      return;
    }
    if (currentPassword === newPassword) {
      res.status(400).json({ error: 'New password must be different from current password' });
      return;
    }
    try {
      authService.changePassword(req.user!.userId, currentPassword, newPassword);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  },

  me(req: Request, res: Response): void {
    res.json({ user: req.user });
  },
};