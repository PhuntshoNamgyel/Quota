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

// Pure calculation — no database — so it can be unit-tested directly.
export function computeQuota(
  attended: number,
  missed: number,
  policy: AttendancePolicy = new StandardAttendancePolicy()
): Quota {
  const held = attended + missed;
  const percentage = held === 0 ? 100 : Math.round((attended / held) * 1000) / 10; // FR13, 1 dp
  const maxAbsencesAllowed = Math.floor(held * 0.1);                                // FR14
  const remainingAbsences = Math.max(0, maxAbsencesAllowed - missed);
  return { held, attended, missed, percentage, maxAbsencesAllowed, remainingAbsences, ...policy.evaluate(percentage) };
}

export class QuotaService {
  constructor(private policy: AttendancePolicy = new StandardAttendancePolicy()) {}

  // FR15: computed live on every read — fetch counts, then delegate to the pure function.
  calculate(moduleId: number, studentId: number): Quota {
    const { attended, missed } = attendanceRepository.studentModuleCounts(moduleId, studentId);
    return computeQuota(attended, missed, this.policy);
  }
}

export const quotaService = new QuotaService();