const SuperAdmin = require("../models/SuperAdmin");
const OtpVerification = require("../models/OtpVerification");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwtUtils");
const { generateOtp } = require("../utils/otpUtils");
const { sendOtpEmail } = require("./emailService");
const bcrypt = require("bcrypt");

/**
 * Register a new Super Admin
 */
const registerSuperAdmin = async ({ name, email, password }) => {
  // Check for existing super admin with same email
  const existing = await SuperAdmin.findOne({ email });
  if (existing) {
    throw { status: 409, message: "Super Admin with this email already exists" };
  }

  // Password hashing is handled by the pre-save hook in the model
  const superAdmin = new SuperAdmin({ name, email, password });
  await superAdmin.save();

  return {
    id: superAdmin._id,
    name: superAdmin.name,
    email: superAdmin.email,
    role: superAdmin.role,
  };
};

/**
 * Login Super Admin — returns access + refresh tokens
 */
const loginSuperAdmin = async ({ email, password }) => {
  const superAdmin = await SuperAdmin.findOne({ email, isActive: true });
  if (!superAdmin) {
    throw { status: 401, message: "Invalid email or password" };
  }

  const isPasswordValid = await superAdmin.comparePassword(password);
  if (!isPasswordValid) {
    throw { status: 401, message: "Invalid email or password" };
  }

  const accessToken = generateAccessToken(superAdmin);
  const refreshToken = generateRefreshToken(superAdmin);

  // Persist refresh token for rotation/revocation support
  superAdmin.refreshToken = refreshToken;
  await superAdmin.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
    superAdmin: {
      id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role,
    },
  };
};

/**
 * Refresh access token using a valid refresh token
 */
const refreshAccessToken = async (token) => {
  if (!token) throw { status: 401, message: "Refresh token is required" };

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw { status: 403, message: "Invalid or expired refresh token" };
  }

  const superAdmin = await SuperAdmin.findById(decoded.id);
  if (!superAdmin || superAdmin.refreshToken !== token) {
    throw { status: 403, message: "Refresh token mismatch or revoked" };
  }

  const newAccessToken = generateAccessToken(superAdmin);
  const newRefreshToken = generateRefreshToken(superAdmin);

  superAdmin.refreshToken = newRefreshToken;
  await superAdmin.save({ validateBeforeSave: false });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Initiate forgot password — generate OTP, save, and email it
 */
const forgotPassword = async (email) => {
  // Delete any existing OTP for this email before creating a new one
  await OtpVerification.deleteMany({ email });

  const otp = generateOtp();

  // Save OTP (expires in 5 min via Mongoose TTL index)
  await OtpVerification.create({ email, otp });

  // Send OTP via email
  const emailSent = await sendOtpEmail(email, otp, "User");
  if (!emailSent) {
    throw { status: 500, message: "Failed to send OTP email. Please try again." };
  }

  return { message: "OTP sent successfully to your email" };
};

/**
 * Verify OTP entered by user
 */
const verifyOtp = async (email, otp) => {
  const record = await OtpVerification.findOne({ email });

  if (!record) {
    throw { status: 400, message: "OTP expired or not found. Please request a new one." };
  }

  // Track failed attempts
  if (record.attempts >= 5) {
    await OtpVerification.deleteOne({ email });
    throw { status: 429, message: "Too many failed attempts. Please request a new OTP." };
  }

  if (record.otp !== otp) {
    record.attempts += 1;
    await record.save();
    throw { status: 400, message: `Invalid OTP. ${5 - record.attempts} attempt(s) remaining.` };
  }

  // Mark as verified so reset password API can proceed
  record.isVerified = true;
  await record.save();

  return { message: "OTP verified successfully. You may now reset your password." };
};

/**
 * Reset password after OTP verification
 */
const resetPassword = async (email, newPassword) => {
  // Only allow reset if OTP was verified
  const record = await OtpVerification.findOne({ email, isVerified: true });
  if (!record) {
    throw { status: 400, message: "OTP not verified. Please complete OTP verification first." };
  }

  const superAdmin = await SuperAdmin.findOne({ email });
  if (!superAdmin) {
    throw { status: 404, message: "Super Admin not found" };
  }

  // Hash new password and save (bypasses pre-save hook intentionally for direct update)
  superAdmin.password = newPassword; // pre-save hook will hash it
  superAdmin.refreshToken = null; // Invalidate all sessions
  await superAdmin.save();

  // Clean up OTP record after successful reset
  await OtpVerification.deleteOne({ email });

  return { message: "Password reset successfully. Please login with your new password." };
};

/**
 * Logout — invalidate refresh token
 */
const logoutSuperAdmin = async (superAdminId) => {
  await SuperAdmin.findByIdAndUpdate(superAdminId, { refreshToken: null });
  return { message: "Logged out successfully" };
};

module.exports = {
  registerSuperAdmin,
  loginSuperAdmin,
  refreshAccessToken,
  forgotPassword,
  verifyOtp,
  resetPassword,
  logoutSuperAdmin,
};
