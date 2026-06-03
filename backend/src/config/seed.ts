// src/config/seed.ts
// Seeds real cohort data with realistic attendance AND the matching threshold alerts.
// Run with: npm run seed
import bcrypt from 'bcryptjs';
import db from './db';
import { computeQuota } from '../services/quotaService';
import { levelFor } from '../observers/NotificationObserver';
import { notificationRepository } from '../repositories/NotificationRepository';

const PASSWORD = 'password123';
const YEAR = 2026;

const LECTURER = { name: 'Module Lecturer', email: 'lecturer.cst@rub.edu.bt' };

const STUDENTS: [string, string][] = [
  ['02240337', 'Ugyen Kinley Phuntshok'],
  ['02240340', 'Gayley Choden'],
  ['02240343', 'Jigden Shakya'],
  ['02240344', 'Jigme Ngawang Chogyal'],
  ['02240349', 'Lhundup Dorji'],
  ['02240350', 'Namgay Lhamo'],
  ['02240352', 'Nyendrak Yoezer Zangmo'],
  ['02240353', 'Pema Losel Maurer'],
  ['02240354', 'Phuntsho Namgyel'],
  ['02240355', 'Sangay Choden'],
  ['02240358', 'Sherab Nima Rigzin'],
  ['02240360', 'Sonam Choki'],
  ['02240361', 'Sonam Choki'],
  ['02240362', 'Sonam Dorji'],
  ['02240363', 'Sonam Wangmo'],
  ['02240365', 'Sonam Zangmo'],
  ['02240370', 'Wangchuk Gyeltshen Zangpo'],
  ['02240371', 'Yeshey Lhaden'],
  ['02240372', 'Yeshey Zhennue'],
  ['02230284', 'Karma Namgay Dorji'],
  ['02230288', 'Kinley Tobgay Lhendrup'],
  ['02230292', 'Nidup Dorji'],
  ['02230298', 'Sangay Tenzin'],
  ['02230304', 'Tandin Wangchuk'],
  ['02230308', 'Thinley Dorji'],
  ['02230309', 'Tshering Norbu'],
  ['02230293', 'Norbu Dhendup'],
];

const MODULES = [
  { name: 'SWE201 Cross Platform Development', slots: [
    { day: 'Tuesday', start: '10:15', end: '12:15' },
    { day: 'Wednesday', start: '11:15', end: '1:15'},
  ]},
  { name: 'SDA202 System Design & Solution Architecture', slots: [
    { day: 'Tuesday', start: '1:15', end: '3:15'},
    { day: 'Wednesday', start: '09:00', end: '11:00' },
  ]},
  { name: 'CTE205 Operating Systems', slots: [
    { day: 'Monday', start: '13:15', end: '14:15' },
    { day: 'Thursday', start: '09:00', end: '10:00' },
    { day: 'Friday', start: '09:00', end: '10:00' },
  ]},
  { name: 'DIS303 Cryptology', slots: [
    { day: 'Monday', start: '11:15', end: '12:15' },
    { day: 'Tuesday', start: '09:00', end: '10:00' },
    { day: 'Thursday', start: '10:15', end: '12:15' },
  ]},
  { name: 'DSO101 Continuous Integration & Continuous Deployment', slots: [
    { day: 'Monday', start: '09:00', end: '11:15' },
    { day: 'Thursday', start: '1:15', end: '3:15'},
  ]},
];

const MONTHS: [number, number][] = [[3, 9], [4, 9], [5, 8]]; // 9 (Mar) + 9 (Apr) + 8 (May) = 26 per module
const TOTAL = STUDENTS.length;

function monthDates(month: number, count: number): string[] {
  const daysInMonth = new Date(YEAR, month, 0).getDate();
  const step = Math.max(1, Math.floor(daysInMonth / (count + 1)));
  return Array.from({ length: count }, (_, i) => {
    const day = Math.min(daysInMonth, (i + 1) * step);
    return `${YEAR}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });
}

function absencesFor(studentIndex: number, moduleIndex: number): number {
  const redStudent = (moduleIndex * 7 + 3) % TOTAL;                 // index 3 (Jigme) is red in SWE201
  if (studentIndex === redStudent) return 6;                       // 20/26 = 76.9% (red, exceptional)
  const yellow = [0, 1, 2].map((k) => (moduleIndex * 4 + 1 + k) % TOTAL);
  if (yellow.includes(studentIndex)) return 3 + (studentIndex % 2); // 3-4 absences (medical zone)
  return studentIndex % 3;                                          // 0-2 absences (green: 92-100%)
}

function seed() {
  db.exec(`
    DELETE FROM notifications;
    DELETE FROM attendance_records;
    DELETE FROM sessions;
    DELETE FROM enrolments;
    DELETE FROM schedules;
    DELETE FROM modules;
    DELETE FROM users;
  `);

  const hash = bcrypt.hashSync(PASSWORD, 10);
  const insertUser     = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
  const insertModule   = db.prepare('INSERT INTO modules (name, lecturer_id) VALUES (?, ?)');
  const insertSchedule = db.prepare('INSERT INTO schedules (module_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)');
  const insertEnrol    = db.prepare('INSERT INTO enrolments (module_id, student_id) VALUES (?, ?)');
  const insertSession  = db.prepare('INSERT INTO sessions (module_id, date) VALUES (?, ?)');
  const insertRecord   = db.prepare('INSERT INTO attendance_records (session_id, student_id, status) VALUES (?, ?, ?)');

  const lecturerId = insertUser.run(LECTURER.name, LECTURER.email, hash, 'lecturer').lastInsertRowid as number;
  const studentIds = STUDENTS.map(([no, name]) =>
    insertUser.run(name, `${no}.cst@rub.edu.bt`, hash, 'student').lastInsertRowid as number
  );

  const sessionDates = MONTHS.flatMap(([m, c]) => monthDates(m, c)); // 26 dates
  const held = sessionDates.length;
  let alertsCreated = 0;

  db.transaction(() => {
    MODULES.forEach((mod, moduleIndex) => {
      const moduleId = insertModule.run(mod.name, lecturerId).lastInsertRowid as number;
      mod.slots.forEach((s) => insertSchedule.run(moduleId, s.day, s.start, s.end));
      studentIds.forEach((sid) => insertEnrol.run(moduleId, sid));

      const sessionIds = sessionDates.map((d) => insertSession.run(moduleId, d).lastInsertRowid as number);

      studentIds.forEach((sid, studentIndex) => {
        const absences = absencesFor(studentIndex, moduleIndex);
        sessionIds.forEach((sessionId, i) => {
          insertRecord.run(sessionId, sid, i < absences ? 'absent' : 'present');
        });

        // Generate the same alert the Observer would on a real submission, so seeded data is consistent.
        const q = computeQuota(held - absences, absences);
        const alert = levelFor(q.percentage, q.remainingAbsences);
        if (alert) { notificationRepository.create(sid, moduleId, alert.level, alert.message); alertsCreated++; }
      });
    });
  })();

  console.log(`Seed complete: 1 lecturer, ${STUDENTS.length} students, ${MODULES.length} modules, ${held} sessions each, ${alertsCreated} alerts.`);
}

seed();