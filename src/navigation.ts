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
export type RootStackParamList = {
  DesignationSelect: undefined;
  AgentLogin: undefined;
  RmLogin: undefined;
  VerifyOtp: { recovery?: boolean; role?: 'agent' | 'rm' | 'trainee' } | undefined;
  GetHelp: { persona?: 'agent' | 'rm' } | undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  PasswordSuccess: undefined;
  Dashboard: undefined;
  RMDashboard: undefined;
  Trainee: undefined;
};

export type AuthScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
