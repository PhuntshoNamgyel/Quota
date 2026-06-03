// src/services/studentService.ts
import { enrolmentRepository } from '../repositories/EnrolmentRepository';
import { attendanceRepository } from '../repositories/AttendanceRepository';
import { quotaService } from './quotaService';
import { notificationRepository } from '../repositories/NotificationRepository';

export const studentService = {
  getDashboard(studentId: number) {
    return enrolmentRepository.findModulesByStudent(studentId).map((m) => ({
      module: { id: m.id, name: m.name },
      quota: quotaService.calculate(m.id, studentId),
    }));
  },

  getHistory(studentId: number, moduleId: number) {
    const enrolled = enrolmentRepository.findModulesByStudent(studentId).some((m) => m.id === moduleId);
    if (!enrolled) throw new Error('Module not found'); // also prevents viewing other modules (NFR03)
    return attendanceRepository.studentModuleHistory(moduleId, studentId);
  },

  getNotifications(studentId: number) {
    const rows = notificationRepository.findByStudent(studentId);
    notificationRepository.markAllRead(studentId); // mark read on fetch, so the badge clears reliably
    return rows;
  },

  getUnreadCount(studentId: number) {
    return notificationRepository.countUnread(studentId);
  },

  markNotificationsRead(studentId: number) {
    notificationRepository.markAllRead(studentId);
  },
};