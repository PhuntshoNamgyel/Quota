// src/repositories/ScheduleRepository.ts
// Repository Pattern: all SQL for the `schedules` table.
import db from '../config/db';
import { Schedule } from '../models';

export class ScheduleRepository {
  create(moduleId: number, dayOfWeek: string, startTime: string, endTime: string): Schedule {
    const r = db.prepare(
      'INSERT INTO schedules (module_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)'
    ).run(moduleId, dayOfWeek, startTime, endTime);
    return db.prepare('SELECT * FROM schedules WHERE id = ?').get(r.lastInsertRowid as number) as Schedule;
  }
  findByModule(moduleId: number): Schedule[] {
    return db.prepare('SELECT * FROM schedules WHERE module_id = ?').all(moduleId) as Schedule[];
  }
}
export const scheduleRepository = new ScheduleRepository();