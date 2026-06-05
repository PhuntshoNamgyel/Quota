// src/observers/AttendanceSubject.ts
export interface QuotaEvent {
  studentId: number;
  moduleId: number;
  percentage: number;
  status: string;
  missed: number;
  maxAbsencesAllowed: number;
  held: number;
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

export const attendanceSubject = new AttendanceSubject();