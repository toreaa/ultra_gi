// Navigation type definitions
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  SessionActive: { sessionId: number };
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
  Programs: undefined;
  Profile: undefined;
};
