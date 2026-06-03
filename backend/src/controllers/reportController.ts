// src/controllers/reportController.ts
import { Request, Response } from 'express';
import { reportService } from '../services/reportService';

export const reportController = {
  moduleReport(req: Request, res: Response): void {
    try {
      res.json(reportService.getModuleReport(req.user!.userId, Number(req.params.id)));
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  },
};