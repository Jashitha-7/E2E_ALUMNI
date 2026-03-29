import logger from "../config/logger.js";

/**
 * Role-based access control middleware
 * Restricts route access to specified roles only
 */
const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error("Not authorized"));
  }

  if (!roles.includes(req.user.role)) {
    // Log unauthorized access attempts
    logger.warn(`Access denied: User ${req.user._id} (${req.user.role}) attempted to access ${req.originalUrl}`);
    res.status(403);
    return next(new Error("Forbidden: You do not have permission to access this resource"));
  }

  return next();
};

/**
 * Admin-only middleware with action logging
 */
const adminOnly = (action) => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error("Not authorized"));
  }

  if (req.user.role !== "admin") {
    logger.warn(`Admin action blocked: User ${req.user._id} (${req.user.role}) attempted: ${action}`);
    res.status(403);
    return next(new Error("Forbidden: Admin access required"));
  }

  // Log admin action
  logger.info(`Admin action: ${action} by ${req.user._id} (${req.user.email})`);
  req.adminAction = action;
  return next();
};

/**
 * Block role tampering - ensures role in request body matches allowed values or is stripped
 */
const blockRoleTampering = (req, res, next) => {
  // Remove role from body to prevent client-side role assignment
  if (req.body && req.body.role !== undefined) {
    logger.warn(`Role tampering attempt blocked: User tried to set role to "${req.body.role}"`);
    delete req.body.role;
  }
  return next();
};

/**
 * Alias for allowRoles - more readable syntax
 */
const requireRole = allowRoles;

export default allowRoles;
export { allowRoles, adminOnly, blockRoleTampering, requireRole };
