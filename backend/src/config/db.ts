// src/config/db.ts
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', '..', 'quota.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL CHECK (role IN ('lecturer', 'student'))
  );

  CREATE TABLE IF NOT EXISTS modules (
    id              INTEGER PRIMARY KEY,
    name            TEXT NOT NULL,
    lecturer_id     INTEGER NOT NULL,
    total_classes   INTEGER NOT NULL DEFAULT 30,
    semester_weeks  INTEGER NOT NULL DEFAULT 14,
    FOREIGN KEY (lecturer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id          INTEGER PRIMARY KEY,
    module_id   INTEGER NOT NULL,
    day_of_week TEXT NOT NULL,
    start_time  TEXT NOT NULL,
    end_time    TEXT NOT NULL,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS enrolments (
    id         INTEGER PRIMARY KEY,
    module_id  INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    FOREIGN KEY (module_id)  REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id),
    UNIQUE (module_id, student_id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id         INTEGER PRIMARY KEY,
    module_id  INTEGER NOT NULL,
    date       TEXT NOT NULL,
    classes    INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS attendance_records (
    id         INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status     TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id),
    UNIQUE (session_id, student_id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id         INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    module_id  INTEGER NOT NULL,
    level      TEXT NOT NULL,
    message    TEXT NOT NULL,
    is_read    INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
  );
`);

try { db.exec(`ALTER TABLE notifications ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0`); } catch {}
try { db.exec(`ALTER TABLE modules ADD COLUMN total_classes INTEGER NOT NULL DEFAULT 30`); } catch {}
try { db.exec(`ALTER TABLE modules ADD COLUMN semester_weeks INTEGER NOT NULL DEFAULT 14`); } catch {}
try { db.exec(`ALTER TABLE sessions ADD COLUMN classes INTEGER NOT NULL DEFAULT 1`); } catch {}

export default db;