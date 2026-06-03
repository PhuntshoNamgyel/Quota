// src/repositories/NotificationRepository.ts
import db from '../config/db';
import { Notification } from '../models';

export class NotificationRepository {
  exists(studentId: number, moduleId: number, level: string): boolean {
    return !!db.prepare(
      'SELECT 1 FROM notifications WHERE student_id = ? AND module_id = ? AND level = ? LIMIT 1'
    ).get(studentId, moduleId, level);
  }
  create(studentId: number, moduleId: number, level: string, message: string): void {
    db.prepare('INSERT INTO notifications (student_id, module_id, level, message) VALUES (?, ?, ?, ?)')
      .run(studentId, moduleId, level, message);
  }
  findByStudent(studentId: number): Notification[] {
    return db.prepare('SELECT * FROM notifications WHERE student_id = ? ORDER BY created_at DESC, id DESC')
      .all(studentId) as Notification[];
  }
}
export const notificationRepository = new NotificationRepository();