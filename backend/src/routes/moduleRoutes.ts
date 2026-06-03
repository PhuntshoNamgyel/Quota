// src/routes/moduleRoutes.ts
// Presentation layer: lecturer-only module management + session operations.
import { Router } from 'express';
import { moduleController } from '../controllers/moduleController';
import { attendanceController } from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('lecturer'));

router.post('/', moduleController.create);                  // FR04
router.get('/', moduleController.list);                     // FR06 data
router.get('/students/all', moduleController.allStudents);
router.post('/:id/enrolments', moduleController.enrol);     // FR05
router.get('/:id/students', moduleController.students);

router.get('/:id/roster', attendanceController.roster);        // FR07 + FR09
router.post('/:id/sessions', attendanceController.submit);     // FR11
router.get('/:id/sessions', attendanceController.listSessions);

export default router;