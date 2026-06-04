// src/repositories/EnrolmentRepository.ts
import db from '../config/db';
import { User, Module } from '../models';

export class EnrolmentRepository {
  enrol(moduleId: number, studentId: number): void {
    db.prepare('INSERT OR IGNORE INTO enrolments (module_id, student_id) VALUES (?, ?)').run(moduleId, studentId);
  }
  unenrol(moduleId: number, studentId: number): void {
    db.prepare('DELETE FROM enrolments WHERE module_id = ? AND student_id = ?').run(moduleId, studentId);
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