// Navigation type definitions
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  ActiveSession: { plannedSessionId?: number }; // Story 5.1: Optional for spontaneous sessions
  SessionSummary: { sessionLogId: number }; // Story 5.5: Session completion summary
  SessionActive: { sessionId: number }; // Legacy, kept for backward compatibility
  SessionAnalysis: { sessionId: number };
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  Goals: undefined;
  GIIssue: { goal: string };
  ProgramSuggestion: { goal: string; giIssue: string };
  ProfileSetup: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Skafferi: undefined;
  Programs: NavigatorScreenParams<ProgramStackParamList>;
  Profile: undefined;
};

export type ProgramStackParamList = {
  ProgramList: undefined;
  ProgramDetail: { programId: number; userProgramId?: number };
  SessionPlan: { sessionId: number; programId: number };
  FuelSelector: { sessionId: number; targetCarbs: number; durationMinutes: number };
};
