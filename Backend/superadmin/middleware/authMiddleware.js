const { verifyAccessToken } = require("../utils/jwtUtils");
const { errorResponse } = require("../utils/responseHelper");
const SuperAdmin = require("../models/SuperAdmin");

/**
 * verifyJWT
 * Validates Bearer token and attaches decoded user to req.superAdmin
 */
const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Access denied: No token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return errorResponse(res, "Invalid or expired token. Please login again.", 403);
    }

    // Confirm super admin still exists and is active
    const superAdmin = await SuperAdmin.findById(decoded.id).select("-password -refreshToken");
    if (!superAdmin || !superAdmin.isActive) {
      return errorResponse(res, "Account not found or deactivated", 401);
    }

    req.superAdmin = superAdmin; // Attach to request
    next();
  } catch (error) {
    console.error("[Auth Middleware] Error:", error);
    return errorResponse(res, "Internal server error during authentication", 500);
  }
};

/**
 * isSuperAdmin
 * Role guard — only allows role === 'superadmin'
 * Must be used AFTER verifyJWT
 */
const isSuperAdmin = (req, res, next) => {
  if (!req.superAdmin || req.superAdmin.role !== "superadmin") {
    return errorResponse(res, "Access denied: Super Admin only", 403);
  }
  next();
};

module.exports = { verifyJWT, isSuperAdmin };
