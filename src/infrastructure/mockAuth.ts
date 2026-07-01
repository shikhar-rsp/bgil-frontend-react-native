/**
 * Mock authentication for QC / demo builds (gated by `ENV.MOCK_AUTH`).
 *
 * Each credential maps to a role, and the role decides which dashboard the user
 * lands on after OTP. These are the credentials QC testers use — keep them in
 * sync with TESTING.md.
 */
export type Role = 'agent' | 'rm' | 'trainee';

type MockCredential = {
  /** IMD code / employee code / mobile number entered on the login screen. */
  id: string;
  /** Password (ignored for mobile-number login, which has no password). */
  password?: string;
  role: Role;
};

/** OTP that always verifies in mock mode. */
export const MOCK_OTP = '123456';

/** Login credentials for the IMD-code / employee-code screens (id + password). */
export const MOCK_CREDENTIALS: MockCredential[] = [
  // Insurance Agent → IMD Code tab
  { id: 'agent@bajaj.com', password: 'Agent@123', role: 'agent' },
  // Insurance Agent → IMD Code tab (a trainee agent lands on the Trainee dashboard)
  { id: 'trainee@bajaj.com', password: 'Trainee@123', role: 'trainee' },
  // Relationship Manager
  { id: 'RM001', password: 'Rm@12345', role: 'rm' },
];

/** Mobile numbers accepted on the Agent → Mobile Number tab (no password). */
export const MOCK_MOBILE_CREDENTIALS: MockCredential[] = [
  { id: '9876543210', role: 'agent' },
  { id: '9000000001', role: 'trainee' },
];

const norm = (v: string) => v.trim().toLowerCase();

/** Resolve a role from an id + password, restricted to `allowedRoles`. */
export const resolveMockRole = (
  id: string,
  password: string,
  allowedRoles: Role[],
): Role | null => {
  const match = MOCK_CREDENTIALS.find(
    (c) => norm(c.id) === norm(id) && c.password === password,
  );
  if (match && allowedRoles.includes(match.role)) {
    return match.role;
  }
  return null;
};

/** Resolve a role from a mobile number, restricted to `allowedRoles`. */
export const resolveMockRoleByMobile = (
  mobile: string,
  allowedRoles: Role[],
): Role | null => {
  const match = MOCK_MOBILE_CREDENTIALS.find((c) => norm(c.id) === norm(mobile));
  if (match && allowedRoles.includes(match.role)) {
    return match.role;
  }
  return null;
};

/** Screen name for a role, used to route after OTP. */
export const dashboardRouteForRole = (role: Role): 'Dashboard' | 'RMDashboard' | 'Trainee' => {
  switch (role) {
    case 'rm':
      return 'RMDashboard';
    case 'trainee':
      return 'Trainee';
    default:
      return 'Dashboard';
  }
};
