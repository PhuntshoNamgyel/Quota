// src/services/quotaService.ts
import { attendanceRepository } from '../repositories/AttendanceRepository';
import { moduleRepository } from '../repositories/ModuleRepository';
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
  plannedTotal?: number,
  policy: AttendancePolicy = new StandardAttendancePolicy()
): Quota {
  const held = attended + missed;
  const percentage = held === 0 ? 100 : Math.round((attended / held) * 1000) / 10; // FR13, 1 dp
  // Allowance uses the planned term length so it's meaningful from day one;
  // falls back to sessions held when no plan is given (keeps older behaviour/tests).
  const basis = plannedTotal && plannedTotal > 0 ? plannedTotal : held;
  const maxAbsencesAllowed = Math.floor(basis * 0.1);                                // FR14
  const remainingAbsences = Math.max(0, maxAbsencesAllowed - missed);
  return { held, attended, missed, percentage, maxAbsencesAllowed, remainingAbsences, ...policy.evaluate(percentage) };
}

export class QuotaService {
  constructor(private policy: AttendancePolicy = new StandardAttendancePolicy()) {}

  // FR15: computed live on every read.
  calculate(moduleId: number, studentId: number): Quota {
    const { attended, missed } = attendanceRepository.studentModuleCounts(moduleId, studentId);
    const module = moduleRepository.findById(moduleId);
    return computeQuota(attended, missed, module?.total_classes, this.policy);
  }
}

export const quotaService = new QuotaService();