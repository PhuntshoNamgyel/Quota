// src/config/db.ts
// Data layer: opens the SQLite connection, enforces foreign keys, and ensures the schema exists.
import Database from 'better-sqlite3';
import path from 'path';

// One shared database connection for the whole app (file lives at backend/quota.db).
const dbPath = path.join(__dirname, '..', '..', 'quota.db');
const db = new Database(dbPath);

// Foreign keys are OFF by default in SQLite. Enabling them enforces referential
// integrity — this is the Reliability quality attribute (NFR04) in practice.
db.pragma('foreign_keys = ON');

// Create all six tables if they don't already exist (proposal §11.3).
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL CHECK (role IN ('lecturer', 'student'))
  );

  CREATE TABLE IF NOT EXISTS modules (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    lecturer_id INTEGER NOT NULL,
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
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
  );
`);

export default db;