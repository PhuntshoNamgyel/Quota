// src/services/moduleService.ts
import { moduleRepository } from '../repositories/ModuleRepository';
import { scheduleRepository } from '../repositories/ScheduleRepository';
import { enrolmentRepository } from '../repositories/EnrolmentRepository';
import { userRepository } from '../repositories/UserRepository';
import { Module, User } from '../models';

interface ScheduleInput { day_of_week: string; start_time: string; end_time: string; }
function publicUser(u: User) { return { id: u.id, name: u.name, email: u.email, role: u.role }; }

export const moduleService = {
  createModule(lecturerId: number, name: string, schedule: ScheduleInput[]) {
    const module = moduleRepository.create(name, lecturerId);
    schedule.forEach((s) => scheduleRepository.create(module.id, s.day_of_week, s.start_time, s.end_time));
    return { ...module, schedule: scheduleRepository.findByModule(module.id) };
  },

  listLecturerModules(lecturerId: number) {
    return moduleRepository.findByLecturer(lecturerId).map((m) => ({
      ...m,
      schedule: scheduleRepository.findByModule(m.id),
      studentCount: enrolmentRepository.findStudentsByModule(m.id).length,
    }));
  },

  assertOwned(lecturerId: number, moduleId: number): Module {
    const module = moduleRepository.findById(moduleId);
    if (!module || module.lecturer_id !== lecturerId) throw new Error('Module not found');
    return module;
  },

  enrolStudent(lecturerId: number, moduleId: number, studentId: number) {
    this.assertOwned(lecturerId, moduleId);
    const student = userRepository.findById(studentId);
    if (!student || student.role !== 'student') throw new Error('Student not found');
    enrolmentRepository.enrol(moduleId, studentId);
    return enrolmentRepository.findStudentsByModule(moduleId).map(publicUser);
  },

  // Enrol every student at once (default cohort intake).
  enrolAllStudents(lecturerId: number, moduleId: number) {
    this.assertOwned(lecturerId, moduleId);
    userRepository.findAllStudents().forEach((s) => enrolmentRepository.enrol(moduleId, s.id));
    return enrolmentRepository.findStudentsByModule(moduleId).map(publicUser);
  },

  // Remove a student (e.g. they don't take this elective).
  unenrolStudent(lecturerId: number, moduleId: number, studentId: number) {
    this.assertOwned(lecturerId, moduleId);
    enrolmentRepository.unenrol(moduleId, studentId);
    return enrolmentRepository.findStudentsByModule(moduleId).map(publicUser);
  },

  listEnrolledStudents(lecturerId: number, moduleId: number) {
    this.assertOwned(lecturerId, moduleId);
    return enrolmentRepository.findStudentsByModule(moduleId).map(publicUser);
  },

  listAllStudents() {
    return userRepository.findAllStudents().map(publicUser);
  },

  updateModule(lecturerId: number, moduleId: number, name: string, schedule: ScheduleInput[]) {
    this.assertOwned(lecturerId, moduleId);
    moduleRepository.update(moduleId, name);
    scheduleRepository.deleteByModule(moduleId);
    schedule.forEach((s) => scheduleRepository.create(moduleId, s.day_of_week, s.start_time, s.end_time));
    return { id: moduleId, name, schedule: scheduleRepository.findByModule(moduleId) };
  },

  deleteModule(lecturerId: number, moduleId: number) {
    this.assertOwned(lecturerId, moduleId);
    moduleRepository.delete(moduleId);
  },
};