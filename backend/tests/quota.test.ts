// tests/quota.test.ts
import { computeQuota } from '../src/services/quotaService';
import { StandardAttendancePolicy } from '../src/strategies/StandardAttendancePolicy';

describe('StandardAttendancePolicy (Strategy)', () => {
  const policy = new StandardAttendancePolicy();

  it('treats 90% and above as compliant (green)', () => {
    expect(policy.evaluate(90).colour).toBe('green');
    expect(policy.evaluate(100).status).toBe('compliant');
  });

  it('treats 80–89% as medical exemption (yellow)', () => {
    expect(policy.evaluate(89).colour).toBe('yellow');
    expect(policy.evaluate(80).status).toBe('medical_exemption');
  });

  it('treats below 80% as non-compliant (red)', () => {
    expect(policy.evaluate(79.9).colour).toBe('red');
    expect(policy.evaluate(0).status).toBe('non_compliant');
  });
});

describe('computeQuota (FR13–FR14)', () => {
  it('computes percentage, max absences, and remaining', () => {
    // 9 attended, 1 missed, 20 total planned classes
    const q = computeQuota(9, 1, 20);
    expect(q.held).toBe(10);
    expect(q.percentage).toBe(90);
    expect(q.maxAbsencesAllowed).toBe(2); // floor(20 * 0.1)
    expect(q.remainingAbsences).toBe(1);  // 2 - 1
    expect(q.colour).toBe('green');
  });

  it('lands in the yellow band at exactly 80%', () => {
    const q = computeQuota(8, 2, 20);
    expect(q.percentage).toBe(80);
    expect(q.colour).toBe('yellow');
  });

  it('lands in the red band below 80%', () => {
    const q = computeQuota(7, 3, 20);
    expect(q.percentage).toBe(70);
    expect(q.colour).toBe('red');
  });

  it('treats zero sessions as 100% (no divide-by-zero)', () => {
    const q = computeQuota(0, 0, 20);
    expect(q.percentage).toBe(100);
    expect(q.held).toBe(0);
    expect(q.colour).toBe('green');
  });

  it('shows correct remaining absences from planned total', () => {
    // Fresh module, no classes held yet — student can still see allowance
    const q = computeQuota(0, 0, 28);
    expect(q.maxAbsencesAllowed).toBe(2); // floor(28 * 0.1)
    expect(q.remainingAbsences).toBe(2);
  });

  it('remaining absences hits zero when allowance is used up', () => {
    const q = computeQuota(18, 2, 20);
    expect(q.maxAbsencesAllowed).toBe(2); // floor(20 * 0.1)
    expect(q.remainingAbsences).toBe(0);  // 2 - 2
  });
});