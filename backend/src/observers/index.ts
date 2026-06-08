// src/observers/index.ts
import { attendanceSubject } from './AttendanceSubject';
import { NotificationObserver } from './NotificationObserver';
import { ConsoleLogObserver } from './ConsoleLogObserver';

// Register all observers once at startup — add new observers here.
attendanceSubject.subscribe(new NotificationObserver());
attendanceSubject.subscribe(new ConsoleLogObserver());

export { attendanceSubject };