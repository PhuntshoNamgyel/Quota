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

// Never send the password hash back to the client.
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

  register(name: string, email: string, password: string, role: Role): AuthResult {
    if (userRepository.findByEmail(email)) {
      throw new Error('Email already registered');
    }
    const hash = bcrypt.hashSync(password, 10);
    const user = userRepository.create(name, email, hash, role);
    return { token: signToken(user), user: toPublic(user) };
  },
};