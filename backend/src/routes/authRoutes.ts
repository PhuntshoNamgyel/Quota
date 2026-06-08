import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.put('/password', authenticate, authController.changePassword);

export default router;