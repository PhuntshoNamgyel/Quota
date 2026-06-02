// src/repositories/UserRepository.ts
// Repository Pattern: all SQL touching the `users` table lives here.
// Controllers/services call these methods and never see raw SQL, which keeps the
// data layer isolated and interchangeable (the Maintainability tactic from §12.5).
import db from '../config/db';
import { User, Role } from '../models';

export class UserRepository {
  // Find a user by email — used during login.
  findByEmail(email: string): User | undefined {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
  }

  // Find a user by id — used to load the authenticated user.
  findById(id: number): User | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  }

  // Create a new user and return the created row.
  create(name: string, email: string, passwordHash: string, role: Role): User {
    const result = db
      .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
      .run(name, email, passwordHash, role);
    return this.findById(result.lastInsertRowid as number)!;
  }
}

// One shared instance — simple dependency injection for a small app.
export const userRepository = new UserRepository();