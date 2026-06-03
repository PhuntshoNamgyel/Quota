// src/navigation/types.ts
export type RootStackParams = {
  Login: undefined;
  ModuleList: undefined;
  CreateModule: undefined;
  ModuleDetail: { moduleId: number; moduleName: string };
  MarkAttendance: { moduleId: number; moduleName: string; sessionId?: number };
  StudentDashboard: undefined;
};