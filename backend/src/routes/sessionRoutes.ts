// src/routes/sessionRoutes.ts
import { Router } from 'express';
import { attendanceController } from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate, authorize('lecturer'));

router.get('/:sessionId', attendanceController.getSession);  // view (for editing)
router.put('/:sessionId', attendanceController.edit);        // FR12 edit
router.delete('/:sessionId', attendanceController.removeSession); // delete session

export default router;