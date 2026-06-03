// src/strategies/AttendancePolicy.ts
export type ComplianceStatus = 'compliant' | 'medical_exemption' | 'non_compliant';
export type ComplianceColour = 'green' | 'yellow' | 'red';

export interface Compliance {
  status: ComplianceStatus;
  colour: ComplianceColour;
  label: string;
}

// Strategy interface: a swappable attendance policy.
export interface AttendancePolicy {
  evaluate(percentage: number): Compliance;
}