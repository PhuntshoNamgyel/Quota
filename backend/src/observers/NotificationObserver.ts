// src/observers/NotificationObserver.ts
import { AttendanceObserver, QuotaEvent } from './AttendanceSubject';
import { notificationRepository } from '../repositories/NotificationRepository';

export function levelFor(percentage: number, remaining: number): { level: string; message: string } | null {
  if (percentage < 80) {
    return { level: 'critical', message: 'Below 80% — non-compliant. No medical exemption applies.' };           // FR22b
  }
  if (percentage < 90) {
    return { level: 'breach', message: 'Below 90% — medical-exemption zone. No absence allowance left.' };        // FR22
  }
  if (percentage < 95) {
    const msg = remaining > 0
      ? `Nearing the limit — you can miss ${remaining} more ${remaining === 1 ? 'class' : 'classes'} before dropping below 90%.`
      : 'No absences left — missing any class drops you below 90%.';
    return { level: 'warning', message: msg };                                                                     // FR21
  }
  return null;
}

export class NotificationObserver implements AttendanceObserver {
  onQuotaEvaluated(event: QuotaEvent): void {
    const result = levelFor(event.percentage, event.remainingAbsences);
    if (!result) return;
    if (notificationRepository.exists(event.studentId, event.moduleId, result.level)) return;
    notificationRepository.create(event.studentId, event.moduleId, result.level, result.message);
  }
}