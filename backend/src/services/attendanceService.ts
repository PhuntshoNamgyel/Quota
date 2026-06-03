// src/services/attendanceService.ts
// Business Logic layer: opening sessions, default-present marking, submission, and edits.
import { quotaService } from './quotaService';
import { attendanceSubject } from '../observers';
import { sessionRepository } from '../repositories/SessionRepository';
import { attendanceRepository } from '../repositories/AttendanceRepository';
import { enrolmentRepository } from '../repositories/EnrolmentRepository';
import { moduleService } from './moduleService';
import { AttendanceStatus, User } from '../models';

function publicStudent(u: User) {
  return { id: u.id, name: u.name, email: u.email };
}

// After attendance changes, recompute each student's quota and broadcast it (Observer).
function fireQuotaEvents(moduleId: number, enrolled: User[]) {
  for (const s of enrolled) {
    const q = quotaService.calculate(moduleId, s.id);
    attendanceSubject.notify({
      studentId: s.id, moduleId, percentage: q.percentage, status: q.status,
      remainingAbsences: q.remainingAbsences,
    });
  }
}

function buildRecords(sessionId: number, enrolled: User[], absentStudentIds: number[]) {
  const absent = new Set(absentStudentIds);
  return enrolled.map((s) => ({
    sessionId,
    studentId: s.id,
    status: (absent.has(s.id) ? 'absent' : 'present') as AttendanceStatus,
  }));
}

export const attendanceService = {
  getRoster(lecturerId: number, moduleId: number) {
    moduleService.assertOwned(lecturerId, moduleId);
    return enrolmentRepository.findStudentsByModule(moduleId).map((s) => ({
      ...publicStudent(s),
      status: 'present' as AttendanceStatus,
    }));
  },

  submitSession(lecturerId: number, moduleId: number, date: string, absentStudentIds: number[]) {
    moduleService.assertOwned(lecturerId, moduleId);
    const session = sessionRepository.create(moduleId, date);
    const enrolled = enrolmentRepository.findStudentsByModule(moduleId);
    attendanceRepository.saveMany(buildRecords(session.id, enrolled, absentStudentIds));
    fireQuotaEvents(moduleId, enrolled);
    return { session, records: attendanceRepository.findBySession(session.id) };
  },

  editSession(lecturerId: number, sessionId: number, absentStudentIds: number[]) {
    const session = sessionRepository.findById(sessionId);
    if (!session) throw new Error('Session not found');
    moduleService.assertOwned(lecturerId, session.module_id);
    const enrolled = enrolmentRepository.findStudentsByModule(session.module_id);
    attendanceRepository.saveMany(buildRecords(sessionId, enrolled, absentStudentIds));
    fireQuotaEvents(session.module_id, enrolled);
    return { session, records: attendanceRepository.findBySession(sessionId) };
  },

  getSession(lecturerId: number, sessionId: number) {
    const session = sessionRepository.findById(sessionId);
    if (!session) throw new Error('Session not found');
    moduleService.assertOwned(lecturerId, session.module_id);
    const statusById = new Map(attendanceRepository.findBySession(sessionId).map((r) => [r.student_id, r.status]));
    const students = enrolmentRepository.findStudentsByModule(session.module_id).map((s) => ({
      ...publicStudent(s),
      status: (statusById.get(s.id) ?? 'present') as AttendanceStatus,
    }));
    return { session, students };
  },

  listSessions(lecturerId: number, moduleId: number) {
    moduleService.assertOwned(lecturerId, moduleId);
    return sessionRepository.findByModule(moduleId);
  },
};