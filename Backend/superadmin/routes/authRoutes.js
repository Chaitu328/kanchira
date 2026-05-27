const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { verifyJWT, isSuperAdmin } = require("../middleware/authMiddleware");
const { loginRateLimiter, forgotPasswordRateLimiter } = require("../middleware/rateLimiter");
const {
  validateRegister,
  validateLogin,
  validateEmail,
  validateOtp,
  validateResetPassword,
} = require("../middleware/validate");

// ─── Public Routes ────────────────────────────────────────────────────────────

/**
 * @route   POST /superadmin/auth/register
 * @desc    Register a new Super Admin
 * @access  Public (should be protected in production by a secret header or IP whitelist)
 */
router.post("/register", validateRegister, authController.register);

/**
 * @route   POST /superadmin/auth/login
 * @desc    Login Super Admin
 * @access  Public
 */
router.post("/login", loginRateLimiter, validateLogin, authController.login);

/**
 * @route   POST /superadmin/auth/refresh-token
 * @desc    Get new access token using refresh token
 * @access  Public
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @route   POST /superadmin/auth/forgot-password
 * @desc    Send OTP to email for password reset
 * @access  Public
 */
router.post("/forgot-password", forgotPasswordRateLimiter, validateEmail, authController.forgotPassword);

/**
 * @route   POST /superadmin/auth/verify-otp
 * @desc    Verify OTP sent to email
 * @access  Public
 */
router.post("/verify-otp", validateOtp, authController.verifyOtp);

/**
 * @route   POST /superadmin/auth/reset-password
 * @desc    Reset password after OTP verification
 * @access  Public
 */
router.post("/reset-password", validateResetPassword, authController.resetPassword);

// ─── Protected Routes (JWT required) ─────────────────────────────────────────

/**
 * @route   POST /superadmin/auth/logout
 * @desc    Logout Super Admin (invalidate refresh token)
 * @access  Private
 */
router.post("/logout", verifyJWT, isSuperAdmin, authController.logout);

/**
 * @route   GET /superadmin/auth/me
 * @desc    Get current Super Admin profile
 * @access  Private
 */
router.get("/me", verifyJWT, isSuperAdmin, authController.getProfile);

module.exports = router;
