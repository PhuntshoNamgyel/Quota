// src/routes/studentRoutes.ts
import { Router } from 'express';
import { studentController } from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('student'));

router.get('/modules', studentController.dashboard);                 // FR17–FR19
router.get('/modules/:moduleId/history', studentController.history); // FR20

export default router;