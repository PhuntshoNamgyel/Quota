// src/observers/ConsoleLogObserver.ts
import { AttendanceObserver, QuotaEvent } from './AttendanceSubject';

// Development observer — logs quota evaluations to the console for debugging.
export class ConsoleLogObserver implements AttendanceObserver {
  onQuotaEvaluated(event: QuotaEvent): void {
    console.log(`[quota] student ${event.studentId} module ${event.moduleId}: ${event.percentage}% (${event.status})`);
  }
}