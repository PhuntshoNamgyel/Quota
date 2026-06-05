// src/repositories/UserRepository.ts
import db from '../config/db';
import { User, Role } from '../models';

export class UserRepository {
  findByEmail(email: string): User | undefined {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
  }

  findById(id: number): User | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  }

  findAllStudents(): User[] {
    return db.prepare("SELECT * FROM users WHERE role = 'student' ORDER BY name").all() as User[];
  }

  create(name: string, email: string, passwordHash: string, role: Role): User {
    const result = db
      .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
      .run(name, email, passwordHash, role);
    return this.findById(result.lastInsertRowid as number)!;
  }

  updatePassword(userId: number, passwordHash: string): void {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
  }
}

export const userRepository = new UserRepository();