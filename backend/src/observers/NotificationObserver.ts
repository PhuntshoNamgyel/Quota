// src/observers/NotificationObserver.ts
import { AttendanceObserver, QuotaEvent } from './AttendanceSubject';
import { notificationRepository } from '../repositories/NotificationRepository';

function levelFor(percentage: number): { level: string; message: string } | null {
  if (percentage < 80) return { level: 'critical', message: 'Below 80%: non-compliant, no medical exemption available.' }; // FR22b
  if (percentage < 90) return { level: 'breach',   message: 'Below 90%: medical exemption zone — at serious risk.' };       // FR22
  if (percentage < 95) return { level: 'warning',  message: 'Below 95%: maintain the mandatory 90% minimum.' };             // FR21
  return null;
}

export class NotificationObserver implements AttendanceObserver {
  onQuotaEvaluated(event: QuotaEvent): void {
    const result = levelFor(event.percentage);
    if (!result) return;
    if (notificationRepository.exists(event.studentId, event.moduleId, result.level)) return; // no duplicate per level
    notificationRepository.create(event.studentId, event.moduleId, result.level, result.message);
  }
}