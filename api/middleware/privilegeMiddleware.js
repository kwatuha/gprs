// backend/middleware/privilegeMiddleware.js
// This middleware checks if the authenticated user has the required privileges.

const privilege = (requiredPrivileges) => (req, res, next) => {
    // Ensure user object and privileges array exist on the request
    // The 'auth' middleware should have already populated req.user
    if (!req.user || !req.user.privileges || !Array.isArray(req.user.privileges)) {
        console.warn('PrivilegeMiddleware: User or user privileges not found on request. Denying access.');
        return res.status(403).json({ error: 'Access denied. Insufficient authentication or user data.' });
    }

    // Check if the user has ALL of the required privileges
    const hasAllRequired = requiredPrivileges.every(priv =>
        req.user.privileges.includes(priv)
    );

    if (hasAllRequired) {
        next(); // User has all required privileges, proceed to the next middleware/route handler
    } else {
        console.warn(`PrivilegeMiddleware: User ${req.user.username} (ID: ${req.user.id}) lacks required privileges.`);
        console.warn('Required:', requiredPrivileges, 'User has:', req.user.privileges);
        return res.status(403).json({ error: 'Access denied. You do not have the necessary privileges to perform this action.' });
    }
};

module.exports = privilege;
