const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const Admin   = require('../models/admin');
const crypto  = require('crypto');

// ── Generate JWT ── includes role so isAdmin middleware can read it
const generateToken = (user) => {
  const payload = {
    id:   user._id,
    role: user.role || 'admin',   // FIXED — role was missing before, isAdmin checks req.user.role
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// ── FIXED: search by email OR phone
// Old admins registered with only a phone (no email) were failing login
// because findOne({ email }) returned null when email field was empty.
const validateCredentials = async (emailOrPhone, password) => {
  const user = await Admin.findOne({
    $or: [
      { email: emailOrPhone },
      { phone: emailOrPhone },
    ],
  });

  console.log('[validateCredentials] found:', user ? (user.email || user.phone) : 'NOT FOUND');

  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;

  return user;
};

// ── Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Access Denied: No Token Provided' });
  }
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or Expired Token' });
  }
};

// ── Role guard: admin only
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access Denied: Admins Only' });
  }
  next();
};

// ── Role guard: admin OR superadmin (for shared endpoints)
// SuperAdmin JWTs are signed with the same JWT_SECRET but have role: 'superadmin'
const isAdminOrSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access Denied: Admin access required' });
  }
  next();
};

module.exports = { generateToken, validateCredentials, verifyToken, isAdmin, isAdminOrSuperAdmin, generateOtp };