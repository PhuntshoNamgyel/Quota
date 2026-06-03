// src/controllers/studentController.ts
import { Request, Response } from 'express';
import { studentService } from '../services/studentService';

export const studentController = {
  dashboard(req: Request, res: Response): void {
    res.json(studentService.getDashboard(req.user!.userId));
  },
  history(req: Request, res: Response): void {
    try {
      res.json(studentService.getHistory(req.user!.userId, Number(req.params.moduleId)));
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  },
  notifications(req: Request, res: Response): void {
    res.json(studentService.getNotifications(req.user!.userId));
  },
  unreadCount(req: Request, res: Response): void {
    res.json({ count: studentService.getUnreadCount(req.user!.userId) });
  },
  markRead(req: Request, res: Response): void {
    studentService.markNotificationsRead(req.user!.userId);
    res.json({ ok: true });
  },
};