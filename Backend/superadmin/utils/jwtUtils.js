const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_EXPIRY = "1d";
const REFRESH_TOKEN_EXPIRY = "7d";

/**
 * Generate a short-lived access token for a SuperAdmin
 * @param {Object} superAdmin - SuperAdmin document
 * @returns {string} signed JWT
 */
const generateAccessToken = (superAdmin) => {
  return jwt.sign(
    {
      id: superAdmin._id,
      email: superAdmin.email,
      role: superAdmin.role, // 'superadmin'
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generate a long-lived refresh token
 * @param {Object} superAdmin - SuperAdmin document
 * @returns {string} signed JWT
 */
const generateRefreshToken = (superAdmin) => {
  return jwt.sign(
    { id: superAdmin._id, role: superAdmin.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

/**
 * Verify an access token
 * @param {string} token
 * @returns {Object} decoded payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify a refresh token
 * @param {string} token
 * @returns {Object} decoded payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
