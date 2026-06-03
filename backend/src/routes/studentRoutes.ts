// src/routes/studentRoutes.ts
import { Router } from 'express';
import { studentController } from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('student'));

router.get('/modules', studentController.dashboard);                 // FR17–FR19
router.get('/modules/:moduleId/history', studentController.history); // FR20
router.get('/notifications', studentController.notifications);       // FR21/FR22/FR22b

export default router;