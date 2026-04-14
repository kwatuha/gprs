/**
 * Align with authRoutes login: treat super_admin / super-admin as super admin.
 */
function normalizeRoleForCompare(role) {
    return String(role ?? '')
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, ' ');
}

function isSuperAdminRequester(reqUser) {
    const raw = reqUser?.roleName ?? reqUser?.role ?? '';
    return normalizeRoleForCompare(raw) === 'super admin';
}

module.exports = {
    normalizeRoleForCompare,
    isSuperAdminRequester,
};
