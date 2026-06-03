// src/controllers/attendanceController.ts
// MVC Controller: HTTP in, attendanceService out.
import { Request, Response } from 'express';
import { attendanceService } from '../services/attendanceService';

export const attendanceController = {
  roster(req: Request, res: Response): void {
    try { res.json(attendanceService.getRoster(req.user!.userId, Number(req.params.id))); }
    catch (err) { res.status(404).json({ error: (err as Error).message }); }
  },

  submit(req: Request, res: Response): void {
    const { date, absentStudentIds } = req.body ?? {};
    if (!date) { res.status(400).json({ error: 'date is required (YYYY-MM-DD)' }); return; }
    try {
      res.status(201).json(attendanceService.submitSession(
        req.user!.userId, Number(req.params.id), date, absentStudentIds ?? []
      ));
    } catch (err) { res.status(404).json({ error: (err as Error).message }); }
  },

  listSessions(req: Request, res: Response): void {
    try { res.json(attendanceService.listSessions(req.user!.userId, Number(req.params.id))); }
    catch (err) { res.status(404).json({ error: (err as Error).message }); }
  },

  getSession(req: Request, res: Response): void {
    try { res.json(attendanceService.getSession(req.user!.userId, Number(req.params.sessionId))); }
    catch (err) { res.status(404).json({ error: (err as Error).message }); }
  },

  edit(req: Request, res: Response): void {
    const { absentStudentIds } = req.body ?? {};
    try {
      res.json(attendanceService.editSession(req.user!.userId, Number(req.params.sessionId), absentStudentIds ?? []));
    } catch (err) { res.status(404).json({ error: (err as Error).message }); }
  },
};