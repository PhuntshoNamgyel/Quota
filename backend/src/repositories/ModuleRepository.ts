// src/repositories/ModuleRepository.ts
import db from '../config/db';
import { Module } from '../models';

export class ModuleRepository {
  create(name: string, lecturerId: number, totalClasses: number): Module {
    const r = db.prepare('INSERT INTO modules (name, lecturer_id, total_classes) VALUES (?, ?, ?)')
      .run(name, lecturerId, totalClasses);
    return this.findById(r.lastInsertRowid as number)!;
  }
  findById(id: number): Module | undefined {
    return db.prepare('SELECT * FROM modules WHERE id = ?').get(id) as Module | undefined;
  }
  findByLecturer(lecturerId: number): Module[] {
    return db.prepare('SELECT * FROM modules WHERE lecturer_id = ? ORDER BY id').all(lecturerId) as Module[];
  }
  update(id: number, name: string, totalClasses: number): void {
    db.prepare('UPDATE modules SET name = ?, total_classes = ? WHERE id = ?').run(name, totalClasses, id);
  }
  delete(id: number): void {
    db.prepare('DELETE FROM modules WHERE id = ?').run(id);
  }
}
export const moduleRepository = new ModuleRepository();