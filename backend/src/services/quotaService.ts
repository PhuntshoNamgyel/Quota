// src/services/quotaService.ts
import { attendanceRepository } from '../repositories/AttendanceRepository';
import { AttendancePolicy, Compliance } from '../strategies/AttendancePolicy';
import { StandardAttendancePolicy } from '../strategies/StandardAttendancePolicy';

export interface Quota extends Compliance {
  held: number;
  attended: number;
  missed: number;
  percentage: number;
  maxAbsencesAllowed: number;
  remainingAbsences: number;
}

export class QuotaService {
  // The policy is injected via the Strategy interface — swap it without touching this class.
  constructor(private policy: AttendancePolicy = new StandardAttendancePolicy()) {}

  // FR15: computed live on every read, so figures are always current — nothing to cache or update.
  calculate(moduleId: number, studentId: number): Quota {
    const { attended, missed } = attendanceRepository.studentModuleCounts(moduleId, studentId);
    const held = attended + missed;
    const percentage = held === 0 ? 100 : Math.round((attended / held) * 1000) / 10; // FR13, 1 dp
    const maxAbsencesAllowed = Math.floor(held * 0.1);                                // FR14
    const remainingAbsences = Math.max(0, maxAbsencesAllowed - missed);
    return { held, attended, missed, percentage, maxAbsencesAllowed, remainingAbsences, ...this.policy.evaluate(percentage) };
  }
}

export const quotaService = new QuotaService();