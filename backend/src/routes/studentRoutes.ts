import { Router } from 'express';
import { studentController } from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All student routes are student-only
router.use(authenticate, authorize('student'));

router.get('/modules', studentController.dashboard);
router.get('/modules/:moduleId/history', studentController.history);
router.get('/notifications', studentController.notifications);
router.get('/notifications/unread-count', studentController.unreadCount);
router.post('/notifications/read', studentController.markRead);

export default router;