
import { Router } from 'express';
import { attendanceController } from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All session routes are lecturer-only
router.use(authenticate, authorize('lecturer'));

router.get('/:sessionId', attendanceController.getSession);
router.put('/:sessionId', attendanceController.edit);
router.delete('/:sessionId', attendanceController.removeSession);

export default router;