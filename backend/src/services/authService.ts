// src/services/authService.ts
// Business Logic layer: authentication rules — hashing, verification, token issuing.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/UserRepository';
import { Role, User } from '../models';
import type { JwtPayload } from '../middleware/auth';

const secret = () => process.env.JWT_SECRET || 'fallback_secret';

function signToken(user: User): string {
  const payload: JwtPayload = { userId: user.id, role: user.role };
  return jwt.sign(payload, secret(), { expiresIn: '7d' });
}

export interface AuthResult {
  token: string;
  user: { id: number; name: string; email: string; role: Role };
}

function toPublic(user: User): AuthResult['user'] {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export const authService = {
  login(email: string, password: string): AuthResult {
    const user = userRepository.findByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      throw new Error('Invalid email or password');
    }
    return { token: signToken(user), user: toPublic(user) };
  },

  changePassword(userId: number, currentPassword: string, newPassword: string): void {
    const user = userRepository.findById(userId);
    if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
      throw new Error('Current password is incorrect');
    }
    const hash = bcrypt.hashSync(newPassword, 10);
    userRepository.updatePassword(userId, hash);
  },
};