/**
 * Match api/routes/authRoutes.js login: underscores/hyphens → spaces before compare.
 */
export function normalizeRoleForCompare(role) {
  return String(role ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ');
}

/** True if JWT user is Super Admin (handles super_admin, Super Admin, etc.). */
export function isSuperAdminUser(user) {
  const raw = user?.role ?? user?.roleName ?? '';
  return normalizeRoleForCompare(raw) === 'super admin';
}
