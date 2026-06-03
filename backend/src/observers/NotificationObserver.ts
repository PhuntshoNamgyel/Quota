// src/observers/NotificationObserver.ts
import { AttendanceObserver, QuotaEvent } from './AttendanceSubject';
import { notificationRepository } from '../repositories/NotificationRepository';

export function levelFor(percentage: number, remaining: number): { level: string; message: string } | null {
  if (percentage < 80) {                                                                                  // FR22b
    return { level: 'critical', message: 'You are below 80% and non-compliant. No medical exemption applies — contact your lecturer immediately.' };
  }
  if (percentage < 90) {                                                                                  // FR22
    return { level: 'breach', message: 'You have dropped below 90% into the medical-exemption zone. You have no attendance allowance left — only a medical certificate can excuse further absence.' };
  }
  if (percentage < 95) {                                                                                  // FR21
    const msg = remaining > 0
      ? `Heads up: you can miss ${remaining} more ${remaining === 1 ? 'class' : 'classes'} before dropping below the mandatory 90%.`
      : 'Heads up: you have no absences left — missing any further class will drop you below the mandatory 90%.';
    return { level: 'warning', message: msg };
  }
  return null;
}

export class NotificationObserver implements AttendanceObserver {
  onQuotaEvaluated(event: QuotaEvent): void {
    const result = levelFor(event.percentage, event.remainingAbsences);
    if (!result) return;
    if (notificationRepository.exists(event.studentId, event.moduleId, result.level)) return; // no duplicate per level
    notificationRepository.create(event.studentId, event.moduleId, result.level, result.message);
  }
}