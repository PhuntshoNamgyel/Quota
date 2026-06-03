// src/repositories/SessionRepository.ts
// Repository Pattern: all SQL for the `sessions` table.
import db from '../config/db';
import { Session } from '../models';

export class SessionRepository {
  create(moduleId: number, date: string): Session {
    const r = db.prepare('INSERT INTO sessions (module_id, date) VALUES (?, ?)').run(moduleId, date);
    return this.findById(r.lastInsertRowid as number)!;
  }
  findById(id: number): Session | undefined {
    return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Session | undefined;
  }
  findByModule(moduleId: number): Session[] {
    return db.prepare('SELECT * FROM sessions WHERE module_id = ? ORDER BY date DESC, id DESC').all(moduleId) as Session[];
  }
  countByModule(moduleId: number): number {
    const row = db.prepare('SELECT COUNT(*) AS n FROM sessions WHERE module_id = ?').get(moduleId) as { n: number };
    return row.n;
  }
}
export const sessionRepository = new SessionRepository();