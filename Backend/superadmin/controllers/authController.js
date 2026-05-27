const authService = require("../services/superAdminAuthService");
const { successResponse, errorResponse } = require("../utils/responseHelper");

/**
 * POST /superadmin/auth/register
 * Register a new Super Admin account
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const data = await authService.registerSuperAdmin({ name, email, password });
    return successResponse(res, "Super Admin registered successfully", data, 201);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

/**
 * POST /superadmin/auth/login
 * Login with email + password, returns access + refresh tokens
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.loginSuperAdmin({ email, password });
    return successResponse(res, "Login successful", data);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

/**
 * POST /superadmin/auth/refresh-token
 * Rotate access token using a valid refresh token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const data = await authService.refreshAccessToken(refreshToken);
    return successResponse(res, "Token refreshed successfully", data);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

/**
 * POST /superadmin/auth/forgot-password
 * Send OTP to registered email
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const data = await authService.forgotPassword(email);
    return successResponse(res, data.message);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

/**
 * POST /superadmin/auth/verify-otp
 * Verify the 6-digit OTP sent to email
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const data = await authService.verifyOtp(email, otp);
    return successResponse(res, data.message);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

/**
 * POST /superadmin/auth/reset-password
 * Reset password after OTP verification
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const data = await authService.resetPassword(email, newPassword);
    return successResponse(res, data.message);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

/**
 * POST /superadmin/auth/logout
 * Invalidate refresh token (requires authentication)
 */
exports.logout = async (req, res) => {
  try {
    const data = await authService.logoutSuperAdmin(req.superAdmin._id);
    return successResponse(res, data.message);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

/**
 * GET /superadmin/auth/me
 * Get current logged-in super admin profile
 */
exports.getProfile = async (req, res) => {
  return successResponse(res, "Profile fetched successfully", {
    id: req.superAdmin._id,
    name: req.superAdmin.name,
    email: req.superAdmin.email,
    role: req.superAdmin.role,
    createdAt: req.superAdmin.createdAt,
  });
};
