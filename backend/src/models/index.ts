// src/models/index.ts
// Domain models — the "M" in MVC. Plain TypeScript shapes that mirror the database rows.

export type Role = 'lecturer' | 'student';
export type AttendanceStatus = 'present' | 'absent';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
}

export interface Module {
  id: number;
  name: string;
  lecturer_id: number;
  total_classes: number; // planned classes for the term (drives the absence allowance)
}

export interface Schedule {
  id: number;
  module_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

export interface Enrolment {
  id: number;
  module_id: number;
  student_id: number;
}

export interface Session {
  id: number;
  module_id: number;
  date: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: number;
  session_id: number;
  student_id: number;
  status: AttendanceStatus;
}

export interface Notification {
  id: number;
  student_id: number;
  module_id: number;
  level: string;
  message: string;
  is_read: number;
  created_at: string;
}