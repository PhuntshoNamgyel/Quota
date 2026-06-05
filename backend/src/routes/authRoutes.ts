// src/routes/authRoutes.ts
import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', authController.login);                               // FR01
router.get('/me', authenticate, authController.me);                        // FR03
router.put('/password', authenticate, authController.changePassword);      // FR04

export default router;