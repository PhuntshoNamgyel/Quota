// src/observers/ConsoleLogObserver.ts
import { AttendanceObserver, QuotaEvent } from './AttendanceSubject';

export class ConsoleLogObserver implements AttendanceObserver {
  onQuotaEvaluated(event: QuotaEvent): void {
    console.log(`[quota] student ${event.studentId} module ${event.moduleId}: ${event.percentage}% (${event.status})`);
  }
}