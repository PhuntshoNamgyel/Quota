// src/repositories/AttendanceRepository.ts
import db from '../config/db';
import { AttendanceRecord, AttendanceStatus } from '../models';

export class AttendanceRepository {
  private upsert = db.prepare(`
    INSERT INTO attendance_records (session_id, student_id, status)
    VALUES (@sessionId, @studentId, @status)
    ON CONFLICT(session_id, student_id) DO UPDATE SET status = excluded.status
  `);

  saveMany(records: { sessionId: number; studentId: number; status: AttendanceStatus }[]): void {
    const tx = db.transaction((rows: typeof records) => {
      for (const r of rows) this.upsert.run(r);
    });
    tx(records);
  }

  findBySession(sessionId: number): AttendanceRecord[] {
    return db.prepare('SELECT * FROM attendance_records WHERE session_id = ?').all(sessionId) as AttendanceRecord[];
  }

  studentModuleCounts(moduleId: number, studentId: number): { attended: number; missed: number } {
    const row = db.prepare(`
      SELECT
        SUM(CASE WHEN ar.status = 'present' THEN s.classes ELSE 0 END) AS attended,
        SUM(CASE WHEN ar.status = 'absent'  THEN s.classes ELSE 0 END) AS missed
      FROM attendance_records ar
      JOIN sessions s ON s.id = ar.session_id
      WHERE s.module_id = ? AND ar.student_id = ?
    `).get(moduleId, studentId) as { attended: number | null; missed: number | null };
    return { attended: row.attended ?? 0, missed: row.missed ?? 0 };
  }

  studentModuleHistory(moduleId: number, studentId: number) {
    return db.prepare(`
      SELECT s.id AS sessionId, s.date AS date, ar.status AS status
      FROM sessions s
      JOIN attendance_records ar ON ar.session_id = s.id AND ar.student_id = ?
      WHERE s.module_id = ?
      ORDER BY s.date DESC, s.id DESC
    `).all(studentId, moduleId) as { sessionId: number; date: string; status: string }[];
  }
}
export const attendanceRepository = new AttendanceRepository();