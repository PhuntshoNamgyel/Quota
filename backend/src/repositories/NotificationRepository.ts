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
  findByStudent(studentId: number) {
    return db.prepare(`
      SELECT n.*, m.name AS module_name
      FROM notifications n
      JOIN modules m ON m.id = n.module_id
      WHERE n.student_id = ?
      ORDER BY n.created_at DESC, n.id DESC
    `).all(studentId) as (Notification & { module_name: string })[];
  }
  countUnread(studentId: number): number {
    const row = db.prepare('SELECT COUNT(*) AS n FROM notifications WHERE student_id = ? AND is_read = 0').get(studentId) as { n: number };
    return row.n;
  }
  markAllRead(studentId: number): void {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE student_id = ?').run(studentId);
  }
}
export const notificationRepository = new NotificationRepository();