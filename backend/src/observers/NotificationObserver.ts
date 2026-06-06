// src/observers/NotificationObserver.ts
import { AttendanceObserver, QuotaEvent } from './AttendanceSubject';
import { notificationRepository } from '../repositories/NotificationRepository';

export function levelFor(
  missed: number,
  maxAbsencesAllowed: number,
  held: number,
  percentage: number,
  totalClasses?: number
): { level: string; message: string } | null {
  if (missed === 0) return null;

  // Non-compliant — already below 90%
  if (percentage < 90) {
    return {
      level: 'critical',
      message: 'You have used more than your allowed absences — your attendance is non-compliant and requires genuine reasons.',
    };
  }

  // Used up entire allowance — one more miss = non-compliant
  if (maxAbsencesAllowed === 0) {
    return {
      level: 'breach',
      message: 'You cannot miss any more classes — 90% attendance is mandatory.',
    };
  }

  // Only 1 absence left in allowance
  if (maxAbsencesAllowed === 1) {
    return {
      level: 'warning',
      message: 'You can miss only 1 more class — 90% attendance is mandatory.',
    };
  }

  // Early warning — student has used half or more of their allowance
  if (totalClasses) {
    const totalAllowed = Math.floor(totalClasses * 0.1);
    if (totalAllowed > 0 && missed >= Math.ceil(totalAllowed / 2)) {
      return {
        level: 'warning',
        message: `You have used ${missed} of your ${totalAllowed} allowed absences — attendance is mandatory.`,
      };
    }
  }

  return null;
}

export class NotificationObserver implements AttendanceObserver {
  onQuotaEvaluated(event: QuotaEvent): void {
    const result = levelFor(event.missed, event.maxAbsencesAllowed, event.held, event.percentage, event.totalClasses);
    if (!result) return;
    if (notificationRepository.exists(event.studentId, event.moduleId, result.level)) return;
    notificationRepository.create(event.studentId, event.moduleId, result.level, result.message);
  }
}