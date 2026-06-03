// src/controllers/moduleController.ts
import { Request, Response } from 'express';
import { moduleService } from '../services/moduleService';

export const moduleController = {
  create(req: Request, res: Response): void {
    const { name, schedule } = req.body ?? {};
    if (!name || !Array.isArray(schedule) || schedule.length === 0) {
      res.status(400).json({ error: 'name and a non-empty schedule array are required' });
      return;
    }
    res.status(201).json(moduleService.createModule(req.user!.userId, name, schedule));
  },

  list(req: Request, res: Response): void {
    res.json(moduleService.listLecturerModules(req.user!.userId));
  },

  allStudents(req: Request, res: Response): void {
    res.json(moduleService.listAllStudents());
  },

  enrol(req: Request, res: Response): void {
    const { studentId } = req.body ?? {};
    if (!studentId) { res.status(400).json({ error: 'studentId is required' }); return; }
    try {
      res.status(201).json(moduleService.enrolStudent(req.user!.userId, Number(req.params.id), Number(studentId)));
    } catch (err) { res.status(404).json({ error: (err as Error).message }); }
  },

  students(req: Request, res: Response): void {
    try {
      res.json(moduleService.listEnrolledStudents(req.user!.userId, Number(req.params.id)));
    } catch (err) { res.status(404).json({ error: (err as Error).message }); }
  },

  remove(req: Request, res: Response): void {
    try {
      moduleService.deleteModule(req.user!.userId, Number(req.params.id));
      res.json({ deleted: true });
    } catch (err) { res.status(404).json({ error: (err as Error).message }); }
  },
};