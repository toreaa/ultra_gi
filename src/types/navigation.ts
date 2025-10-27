// Navigation type definitions
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  ActiveSession: { plannedSessionId?: number }; // Story 5.1: Optional for spontaneous sessions
  SessionSummary: { sessionLogId: number }; // Story 5.5: Session completion summary
  SessionDetail: { sessionLogId: number }; // Story 7.1: View completed session details
  SessionGraph: { sessionLogId: number }; // Story 7.2: Graph view for completed session
  PatternAnalysis: undefined; // Story 7.3: Pattern analysis with statistics table
  ProgramProgression: { programId: number }; // Story 7.6: Program progression graph
  ComparePrograms: undefined; // Story 7.7: Compare 2-3 programs side by side
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
