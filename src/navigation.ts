import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Shared navigation param list for the native stack.
 *
 * Maps the web app's react-router routes to native screens:
 *   '/'                     -> DesignationSelect
 *   '/auth/agent'           -> AgentLogin
 *   '/auth/rm'              -> RmLogin
 *   '/auth/otp'             -> VerifyOtp        (router state -> { recovery })
 *   '/auth/help'            -> GetHelp          (router state -> { persona })
 *   '/auth/forgot-password' -> ForgotPassword
 *   '/auth/reset-password'  -> ResetPassword
 *   '/auth/reset-success'   -> PasswordSuccess
 *   '/dashboard'            -> Dashboard
 */
/** An agent an RM can "view as" from the profile page. */
export type AgentViewTarget = { name: string; code: string };

export type RootStackParamList = {
  DesignationSelect: undefined;
  AgentLogin: undefined;
  RmLogin: undefined;
  VerifyOtp: { recovery?: boolean; role?: 'agent' | 'rm' | 'trainee' } | undefined;
  GetHelp: { persona?: 'agent' | 'rm' } | undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  PasswordSuccess: undefined;
  /** `startTour` re-runs the product walkthrough (Profile → Product Tour). */
  Dashboard: { startTour?: boolean } | undefined;
  /** `viewAgent` puts the RM dashboard into read-only "agent view" mode. */
  RMDashboard: { viewAgent?: AgentViewTarget } | undefined;
  Trainee: undefined;
  /** Shared notifications page, opened from the dashboard bell. */
  Notifications: undefined;
  /** Shared profile page — the RM variant adds the Agent View picker. */
  Profile: {
    persona: 'agent' | 'rm' | 'trainee';
    userName: string;
    userId: string;
    userInitials: string;
  };
  /**
   * "My Profile" (Module 10) — the detail screen behind Profile → View Profile.
   * `perspective: 'rm'` shows the RM's own identity instead of the agent's.
   */
  MyProfile: { perspective?: 'agent' | 'rm' } | undefined;
};

export type AuthScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
