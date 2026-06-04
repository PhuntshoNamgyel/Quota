// src/services/reportService.ts
import { moduleService } from './moduleService';
import { enrolmentRepository } from '../repositories/EnrolmentRepository';
import { sessionRepository } from '../repositories/SessionRepository';
import { quotaService } from './quotaService';

export const reportService = {
  getModuleReport(lecturerId: number, moduleId: number) {
    const module = moduleService.assertOwned(lecturerId, moduleId);
    const totalSessions = sessionRepository.countByModule(moduleId);

    const students = enrolmentRepository.findStudentsByModule(moduleId).map((s) => ({
      student: { id: s.id, name: s.name, no: s.email.split('.')[0] },
      quota: quotaService.calculate(moduleId, s.id),
    }));

    const classAverage = students.length
      ? Math.round((students.reduce((sum, r) => sum + r.quota.percentage, 0) / students.length) * 10) / 10
      : 0;

    const atRisk = students
      .filter((r) => r.quota.percentage < 90)
      .sort((a, b) => a.quota.percentage - b.quota.percentage);

    return { module: { id: module.id, name: module.name }, totalSessions, classAverage, students, atRisk };
  },
};