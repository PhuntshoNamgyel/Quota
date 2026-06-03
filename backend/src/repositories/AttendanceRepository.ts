// src/repositories/AttendanceRepository.ts
// Repository Pattern: all SQL for the `attendance_records` table.
import db from '../config/db';
import { AttendanceRecord, AttendanceStatus } from '../models';

export class AttendanceRepository {
  // Upsert keyed on (session_id, student_id): works for first submission AND edits (FR12).
  private upsert = db.prepare(`
    INSERT INTO attendance_records (session_id, student_id, status)
    VALUES (@sessionId, @studentId, @status)
    ON CONFLICT(session_id, student_id) DO UPDATE SET status = excluded.status
  `);

  // Save many records in a single transaction — all or nothing (NFR04 Reliability).
  saveMany(records: { sessionId: number; studentId: number; status: AttendanceStatus }[]): void {
    const tx = db.transaction((rows: typeof records) => {
      for (const r of rows) this.upsert.run(r);
    });
    tx(records);
  }

  findBySession(sessionId: number): AttendanceRecord[] {
    return db.prepare('SELECT * FROM attendance_records WHERE session_id = ?').all(sessionId) as AttendanceRecord[];
  }
}
export const attendanceRepository = new AttendanceRepository();