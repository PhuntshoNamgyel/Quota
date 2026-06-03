// src/repositories/ModuleRepository.ts
// Repository Pattern: all SQL for the `modules` table.
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
}
export const moduleRepository = new ModuleRepository();