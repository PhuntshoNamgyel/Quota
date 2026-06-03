// src/strategies/StandardAttendancePolicy.ts
import { AttendancePolicy, Compliance } from './AttendancePolicy';

// The college's current rule. To change policy, add another AttendancePolicy
// implementation — no calculation code changes.
export class StandardAttendancePolicy implements AttendancePolicy {
  evaluate(percentage: number): Compliance {
    if (percentage >= 90) return { status: 'compliant', colour: 'green', label: 'Compliant' };
    if (percentage >= 80) return { status: 'medical_exemption', colour: 'yellow', label: 'Medical exemption zone' };
    return { status: 'non_compliant', colour: 'red', label: 'Non-compliant' };
  }
}