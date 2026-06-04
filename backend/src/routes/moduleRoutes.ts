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
router.post('/:id/enrolments/all', moduleController.enrolAll);          // enrol everyone
router.post('/:id/enrolments', moduleController.enrol);                 // enrol one
router.delete('/:id/enrolments/:studentId', moduleController.unenrol);  // remove one
router.get('/:id/students', moduleController.students);
router.put('/:id', moduleController.update);
router.delete('/:id', moduleController.remove);
router.get('/:id/roster', attendanceController.roster);
router.post('/:id/sessions', attendanceController.submit);
router.get('/:id/sessions', attendanceController.listSessions);
router.get('/:id/report', reportController.moduleReport);

export default router;