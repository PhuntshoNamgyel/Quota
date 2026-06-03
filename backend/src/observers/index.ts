// src/observers/index.ts
import { attendanceSubject } from './AttendanceSubject';
import { NotificationObserver } from './NotificationObserver';
import { ConsoleLogObserver } from './ConsoleLogObserver';

attendanceSubject.subscribe(new NotificationObserver());
attendanceSubject.subscribe(new ConsoleLogObserver());

export { attendanceSubject };