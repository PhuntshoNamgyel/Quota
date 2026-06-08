// src/observers/AttendanceSubject.ts

// Emitted after every attendance calculation; consumed by observers to trigger notifications.
export interface QuotaEvent {
  studentId: number;
  moduleId: number;
  percentage: number;
  status: string;
  missed: number;
  maxAbsencesAllowed: number;
  held: number;
  totalClasses: number;
}

export interface AttendanceObserver {
  onQuotaEvaluated(event: QuotaEvent): void;
}

class AttendanceSubject {
  private observers: AttendanceObserver[] = [];

  subscribe(observer: AttendanceObserver): void {
    this.observers.push(observer);
  }

  notify(event: QuotaEvent): void {
    this.observers.forEach((o) => o.onQuotaEvaluated(event));
  }
}

// Singleton — shared across the app so all observers receive the same events.
export const attendanceSubject = new AttendanceSubject();