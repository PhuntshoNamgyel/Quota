// src/routes/moduleRoutes.ts
import { Router } from 'express';
import { moduleController } from '../controllers/moduleController';
import { attendanceController } from '../controllers/attendanceController';
import { reportController } from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate, authorize('lecturer'));

router.post('/', moduleController.create);
router.get('/', moduleController.list);
router.get('/students/all', moduleController.allStudents);
router.post('/:id/enrolments', moduleController.enrol);
router.get('/:id/students', moduleController.students);
router.put('/:id', moduleController.update);                  // edit module
router.delete('/:id', moduleController.remove);               // delete module
router.get('/:id/roster', attendanceController.roster);
router.post('/:id/sessions', attendanceController.submit);
router.get('/:id/sessions', attendanceController.listSessions);
router.get('/:id/report', reportController.moduleReport);

export default router;