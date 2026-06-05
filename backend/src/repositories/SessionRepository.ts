// src/repositories/SessionRepository.ts
import db from '../config/db';
import { Session } from '../models';

export class SessionRepository {
  create(moduleId: number, date: string, classes: number): Session {
    const r = db.prepare('INSERT INTO sessions (module_id, date, classes) VALUES (?, ?, ?)').run(moduleId, date, classes);
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
  delete(id: number): void {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
  }
}
export const sessionRepository = new SessionRepository();