// src/services/studentService.ts
import { enrolmentRepository } from '../repositories/EnrolmentRepository';
import { attendanceRepository } from '../repositories/AttendanceRepository';
import { quotaService } from './quotaService';

export const studentService = {
  // FR17–FR19 data: each enrolled module with its computed quota and colour.
  getDashboard(studentId: number) {
    return enrolmentRepository.findModulesByStudent(studentId).map((m) => ({
      module: { id: m.id, name: m.name },
      quota: quotaService.calculate(m.id, studentId),
    }));
  },

  // FR20: session-by-session history for one of the student's own modules.
  getHistory(studentId: number, moduleId: number) {
    const enrolled = enrolmentRepository.findModulesByStudent(studentId).some((m) => m.id === moduleId);
    if (!enrolled) throw new Error('Module not found'); // also prevents viewing other modules (NFR03)
    return attendanceRepository.studentModuleHistory(moduleId, studentId);
  },
};