const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const crypto = require("crypto");

const generateToken = (user) => {
  const payload = {
    id: user._id,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const generateOtp = () => {
  const otp = crypto.randomInt(100000, 999999).toString(); // Secure Random OTP
  return otp;
};

const validateCredentials = async (email, password) => {
  const user = await Admin.findOne({ email });

  console.log(user);
  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;

  return user;
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Access Denied: No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded; // Attach user data to request object
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or Expired Token" });
  }
};

// Middleware to check if user is an Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access Denied: Admins Only" });
  }
  next();
};

module.exports = { generateToken, validateCredentials, verifyToken, isAdmin, generateOtp };
