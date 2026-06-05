// src/navigation/types.ts
export type RootStackParams = {
  Login: undefined;
  ModuleList: undefined;
  CreateModule: { moduleId?: number } | undefined;
  ModuleDetail: { moduleId: number; moduleName: string };
  MarkAttendance: { moduleId: number; moduleName: string; sessionId?: number; slotStart?: string; slotEnd?: string };
  Reports: { moduleId: number; moduleName: string };
  StudentDashboard: undefined;
  StudentHistory: { moduleId: number; moduleName: string };
  StudentNotifications: undefined;
};