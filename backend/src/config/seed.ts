// src/config/seed.ts
// Inserts sample data so every feature can be tested and demoed immediately.
// Run with: npm run seed
import bcrypt from 'bcryptjs';
import db from './db';

function seed() {
  // Wipe existing rows (child tables first) so the seed is repeatable.
  db.exec(`
    DELETE FROM attendance_records;
    DELETE FROM sessions;
    DELETE FROM enrolments;
    DELETE FROM schedules;
    DELETE FROM modules;
    DELETE FROM users;
  `);

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);
  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  );

  // 1 lecturer + 3 students. All passwords are "password123".
  const lecturerId = insertUser.run('Dr. Tashi', 'lecturer@quota.bt', hash('password123'), 'lecturer').lastInsertRowid as number;
  const s1 = insertUser.run('Sonam', 'sonam@quota.bt', hash('password123'), 'student').lastInsertRowid as number;
  const s2 = insertUser.run('Pema',  'pema@quota.bt',  hash('password123'), 'student').lastInsertRowid as number;
  const s3 = insertUser.run('Karma', 'karma@quota.bt', hash('password123'), 'student').lastInsertRowid as number;

  // 1 module owned by the lecturer, with a weekly schedule.
  const moduleId = db.prepare('INSERT INTO modules (name, lecturer_id) VALUES (?, ?)')
    .run('SWE201 Cross Platform Development', lecturerId).lastInsertRowid as number;
  db.prepare('INSERT INTO schedules (module_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)')
    .run(moduleId, 'Monday', '09:00', '11:00');

  // Enrol all three students.
  const enrol = db.prepare('INSERT INTO enrolments (module_id, student_id) VALUES (?, ?)');
  [s1, s2, s3].forEach((sid) => enrol.run(moduleId, sid));

  // 10 past sessions with attendance designed to hit each colour band:
  //   Sonam 1 absent  -> 90% green | Pema 2 absent -> 80% yellow | Karma 3 absent -> 70% red
  const insertSession = db.prepare('INSERT INTO sessions (module_id, date) VALUES (?, ?)');
  const insertRecord  = db.prepare('INSERT INTO attendance_records (session_id, student_id, status) VALUES (?, ?, ?)');

  const sessionIds: number[] = [];
  for (let i = 1; i <= 10; i++) {
    sessionIds.push(insertSession.run(moduleId, `2026-05-${String(i).padStart(2, '0')}`).lastInsertRowid as number);
  }

  const absentSessions: Record<number, number[]> = {
    [s1]: [1],          // 9/10 attended = 90%  -> green
    [s2]: [1, 2],       // 8/10 attended = 80%  -> yellow
    [s3]: [1, 2, 3],    // 7/10 attended = 70%  -> red
  };

  [s1, s2, s3].forEach((sid) => {
    sessionIds.forEach((sessionId, idx) => {
      const isAbsent = absentSessions[sid].includes(idx + 1);
      insertRecord.run(sessionId, sid, isAbsent ? 'absent' : 'present');
    });
  });

  console.log('Seed complete: 1 lecturer, 3 students, 1 module, 10 sessions, attendance set (green/yellow/red).');
}

seed();