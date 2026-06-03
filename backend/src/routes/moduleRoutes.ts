// src/routes/moduleRoutes.ts
// Presentation layer: lecturer-only module management (RBAC applied to the whole router).
import { Router } from 'express';
import { moduleController } from '../controllers/moduleController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('lecturer')); // every route below requires a lecturer

router.post('/', moduleController.create);                  // FR04
router.get('/', moduleController.list);                     // FR06 data
router.get('/students/all', moduleController.allStudents);  // pick students to enrol
router.post('/:id/enrolments', moduleController.enrol);     // FR05
router.get('/:id/students', moduleController.students);     // enrolled students

export default router;