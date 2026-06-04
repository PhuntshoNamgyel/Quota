// src/repositories/ModuleRepository.ts
import db from '../config/db';
import { Module } from '../models';

export class ModuleRepository {
  create(name: string, lecturerId: number): Module {
    const r = db.prepare('INSERT INTO modules (name, lecturer_id) VALUES (?, ?)').run(name, lecturerId);
    return this.findById(r.lastInsertRowid as number)!;
  }
  findById(id: number): Module | undefined {
    return db.prepare('SELECT * FROM modules WHERE id = ?').get(id) as Module | undefined;
  }
  findByLecturer(lecturerId: number): Module[] {
    return db.prepare('SELECT * FROM modules WHERE lecturer_id = ? ORDER BY id').all(lecturerId) as Module[];
  }
  update(id: number, name: string): void {
    db.prepare('UPDATE modules SET name = ? WHERE id = ?').run(name, id);
  }
  delete(id: number): void {
    // FK cascades remove the module's schedules, enrolments, sessions and attendance records.
    db.prepare('DELETE FROM modules WHERE id = ?').run(id);
  }
}
export const moduleRepository = new ModuleRepository();