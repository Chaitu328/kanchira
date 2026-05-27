const { errorResponse } = require("../utils/responseHelper");

/**
 * Validate Super Admin registration fields
 */
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push("Name must be at least 2 characters");
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    errors.push("Valid email is required");
  if (!password || password.length < 6)
    errors.push("Password must be at least 6 characters");

  if (errors.length) return errorResponse(res, "Validation failed", 422, errors);
  next();
};

/**
 * Validate login fields
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Valid email is required");
  if (!password) errors.push("Password is required");

  if (errors.length) return errorResponse(res, "Validation failed", 422, errors);
  next();
};

/**
 * Validate forgot password (email only)
 */
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return errorResponse(res, "Valid email is required", 422);
  }
  next();
};

/**
 * Validate OTP submission
 */
const validateOtp = (req, res, next) => {
  const { email, otp } = req.body;
  const errors = [];

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Valid email is required");
  if (!otp || !/^\d{6}$/.test(otp)) errors.push("OTP must be exactly 6 digits");

  if (errors.length) return errorResponse(res, "Validation failed", 422, errors);
  next();
};

/**
 * Validate reset password
 */
const validateResetPassword = (req, res, next) => {
  const { email, newPassword, confirmPassword } = req.body;
  const errors = [];

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Valid email is required");
  if (!newPassword || newPassword.length < 6)
    errors.push("New password must be at least 6 characters");
  if (newPassword !== confirmPassword) errors.push("Passwords do not match");

  if (errors.length) return errorResponse(res, "Validation failed", 422, errors);
  next();
};

/**
 * Validate special coupon creation/update
 */
const validateCoupon = (req, res, next) => {
  const { code, description, discountType, discountValue, expiryDate } = req.body;
  const errors = [];

  if (!code || code.trim().length < 3) errors.push("Coupon code must be at least 3 characters");
  if (!description) errors.push("Description is required");
  if (!["percentage", "flat"].includes(discountType))
    errors.push("Discount type must be 'percentage' or 'flat'");
  if (discountValue === undefined || discountValue < 0)
    errors.push("Discount value must be 0 or greater");
  if (discountType === "percentage" && discountValue > 100)
    errors.push("Percentage discount cannot exceed 100%");
  if (!expiryDate) errors.push("Expiry date is required");

  if (errors.length) return errorResponse(res, "Validation failed", 422, errors);
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateEmail,
  validateOtp,
  validateResetPassword,
  validateCoupon,
};
