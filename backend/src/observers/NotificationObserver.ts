// src/observers/NotificationObserver.ts
import { AttendanceObserver, QuotaEvent } from './AttendanceSubject';
import { notificationRepository } from '../repositories/NotificationRepository';

const MIN_SESSIONS_FOR_ALERT = 10;

export function levelFor(missed: number, maxAbsencesAllowed: number, held: number, percentage: number): { level: string; message: string } | null {
  if (missed === 0) return null;
  if (held < MIN_SESSIONS_FOR_ALERT) return null;
  if (percentage < 90) {
    return { level: 'critical', message: 'You have used more than your allowed absences — your attendance is non-compliant and requires genuine reasons.' };
  }
  if (maxAbsencesAllowed === 0) {
    return { level: 'breach', message: 'You cannot miss any more classes — 90% attendance is mandatory.' };
  }
  if (maxAbsencesAllowed === 1) {
    return { level: 'warning', message: 'You can miss only 1 more class — 90% attendance is mandatory.' };
  }
  return null;
}

export class NotificationObserver implements AttendanceObserver {
  onQuotaEvaluated(event: QuotaEvent): void {
    const result = levelFor(event.missed, event.maxAbsencesAllowed, event.held, event.percentage);
    if (!result) return;
    if (notificationRepository.exists(event.studentId, event.moduleId, result.level)) return;
    notificationRepository.create(event.studentId, event.moduleId, result.level, result.message);
  }
}