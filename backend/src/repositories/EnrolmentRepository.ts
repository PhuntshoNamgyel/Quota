// src/repositories/EnrolmentRepository.ts
// Repository Pattern: all SQL for the `enrolments` table (with joins to users/modules).
import db from '../config/db';
import { User, Module } from '../models';

export class EnrolmentRepository {
  // INSERT OR IGNORE relies on the UNIQUE(module_id, student_id) constraint:
  // re-enrolling the same student is a harmless no-op.
  enrol(moduleId: number, studentId: number): void {
    db.prepare('INSERT OR IGNORE INTO enrolments (module_id, student_id) VALUES (?, ?)').run(moduleId, studentId);
  }
  findStudentsByModule(moduleId: number): User[] {
    return db.prepare(`
      SELECT u.* FROM users u
      JOIN enrolments e ON e.student_id = u.id
      WHERE e.module_id = ?
      ORDER BY u.name
    `).all(moduleId) as User[];
  }
  findModulesByStudent(studentId: number): Module[] {
    return db.prepare(`
      SELECT m.* FROM modules m
      JOIN enrolments e ON e.module_id = m.id
      WHERE e.student_id = ?
      ORDER BY m.name
    `).all(studentId) as Module[];
  }
}
export const enrolmentRepository = new EnrolmentRepository();