// src/routes/authRoutes.ts
// Presentation layer: maps auth endpoints to controller actions.
import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', authController.login);        // FR01
router.post('/register', authController.register);   // FR02 (role assigned here)
router.get('/me', authenticate, authController.me);  // FR03 (protected — proves JWT works)

export default router;