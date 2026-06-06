// src/config/seed.ts
import bcrypt from 'bcryptjs';
import db from './db';
import { computeQuota } from '../services/quotaService';
import { levelFor } from '../observers/NotificationObserver';
import { notificationRepository } from '../repositories/NotificationRepository';

const LECTURER_PASSWORD = 'Lecturer123';
const YEAR = 2026;
const SEMESTER_WEEKS = 10;

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
    { day: 'Wednesday', start: '11:15', end: '13:15' },
  ]},
  { name: 'SDA202 System Design & Solution Architecture', slots: [
    { day: 'Tuesday', start: '13:15', end: '15:15' },
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
    { day: 'Thursday', start: '13:15', end: '15:15' },
  ]},
];

const MONTHS: [number, number][] = [[3, 8], [4, 8], [5, 8]];

// Break-aware class counter — mirrors slotUtils.ts logic
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function slotClasses(start: string, end: string): number {
  let minutes = timeToMinutes(end) - timeToMinutes(start);
  const slotStart = timeToMinutes(start);
  const slotEnd = timeToMinutes(end);
  if (slotStart < timeToMinutes('10:00') && slotEnd > timeToMinutes('10:15')) minutes -= 15;
  if (slotStart < timeToMinutes('12:15') && slotEnd > timeToMinutes('13:15')) minutes -= 60;
  return Math.max(1, Math.round(minutes / 60));
}

function totalClassesForModule(slots: { start: string; end: string }[]): number {
  const perWeek = slots.reduce((sum, s) => sum + slotClasses(s.start, s.end), 0);
  return perWeek * SEMESTER_WEEKS;
}

function monthDates(month: number, count: number): string[] {
  const daysInMonth = new Date(YEAR, month, 0).getDate();
  const step = Math.max(1, Math.floor(daysInMonth / (count + 1)));
  return Array.from({ length: count }, (_, i) => {
    const day = Math.min(daysInMonth, (i + 1) * step);
    return `${YEAR}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });
}

function absencesFor(_studentIndex: number, _moduleIndex: number): number {
  return 0;
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

  const lecturerHash = bcrypt.hashSync(LECTURER_PASSWORD, 10);
  const insertUser     = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)');
  const insertModule   = db.prepare('INSERT INTO modules (name, lecturer_id, total_classes, semester_weeks) VALUES (?, ?, ?, ?)');
  const insertSchedule = db.prepare('INSERT INTO schedules (module_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)');
  const insertEnrol    = db.prepare('INSERT INTO enrolments (module_id, student_id) VALUES (?, ?)');
  const insertSession  = db.prepare('INSERT INTO sessions (module_id, date) VALUES (?, ?)');
  const insertRecord   = db.prepare('INSERT INTO attendance_records (session_id, student_id, status) VALUES (?, ?, ?)');

  const lecturerId = insertUser.run(LECTURER.name, LECTURER.email, lecturerHash, 'lecturer').lastInsertRowid as number;

  // Each student's initial password is their student number
  const studentIds = STUDENTS.map(([no, name]) => {
    const studentHash = bcrypt.hashSync(no, 10);
    return insertUser.run(name, `${no}.cst@rub.edu.bt`, studentHash, 'student').lastInsertRowid as number;
  });

  const sessionDates = MONTHS.flatMap(([m, c]) => monthDates(m, c));
  const held = sessionDates.length;
  let alertsCreated = 0;

  db.transaction(() => {
    MODULES.forEach((mod, moduleIndex) => {
      const totalClasses = totalClassesForModule(mod.slots);
      const moduleId = insertModule.run(mod.name, lecturerId, totalClasses, SEMESTER_WEEKS).lastInsertRowid as number;
      mod.slots.forEach((s) => insertSchedule.run(moduleId, s.day, s.start, s.end));
      studentIds.forEach((sid) => insertEnrol.run(moduleId, sid));

      const sessionIds = sessionDates.map((d) => insertSession.run(moduleId, d).lastInsertRowid as number);

      studentIds.forEach((sid, studentIndex) => {
        const absences = absencesFor(studentIndex, moduleIndex);
        sessionIds.forEach((sessionId, i) => {
          insertRecord.run(sessionId, sid, i < absences ? 'absent' : 'present');
        });

        const q = computeQuota(held - absences, absences, totalClasses);
        const alert = levelFor(absences, q.maxAbsencesAllowed, held, q.percentage, totalClasses);
        if (alert) { notificationRepository.create(sid, moduleId, alert.level, alert.message); alertsCreated++; }
      });
    });
  })();

  console.log(`Seed complete: 1 lecturer, ${STUDENTS.length} students, ${MODULES.length} modules, ${held} sessions each, ${alertsCreated} alerts.`);
}

seed();