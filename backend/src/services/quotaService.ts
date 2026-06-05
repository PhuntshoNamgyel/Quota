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
  const percentage = held === 0 ? 100 : Math.round((attended / held) * 1000) / 10;
  const basis = plannedTotal && plannedTotal > 0 ? plannedTotal : held;
  const maxAbsencesAllowed = Math.max(0, Math.floor(attended / 0.9) - held);
  const remainingAbsences = maxAbsencesAllowed;
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