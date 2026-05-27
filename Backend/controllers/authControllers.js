const Admin  = require('../models/admin');
const bcrypt = require('bcrypt');
const { generateToken, validateCredentials } = require('../middleware/authMiddleware');

// ── REGISTER ADMIN ────────────────────────────────────────────────
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!password) {
      return res.status(200).json({ responseCode: 401, message: 'Password is required' });
    }
    if (!phone) {
      return res.status(200).json({ responseCode: 401, message: 'Phone is required' });
    }

    // FIXED: check phone OR email separately so we don't miss existing records
    const existingByPhone = await Admin.findOne({ phone });
    if (existingByPhone) {
      return res.status(200).json({ responseCode: 401, message: 'Phone already exists' });
    }

    if (email) {
      const existingByEmail = await Admin.findOne({ email });
      if (existingByEmail) {
        return res.status(200).json({ responseCode: 401, message: 'Email already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // FIXED: always save role: 'admin' so token verification works
    const user = new Admin({ name, email, phone, password: hashedPassword, role: 'admin' });
    await user.save();

    res.status(201).json({ responseCode: 201, message: 'Registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register admin' });
  }
};

// ── ADMIN LOGIN ───────────────────────────────────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[adminLogin] Attempt with:', email);

    // validateCredentials now searches by email OR phone
    // so admins registered with only a phone number can still login
    const user = await validateCredentials(email, password);

    console.log('[adminLogin] User found:', user ? (user.email || user.phone) : 'NOT FOUND');
    console.log('[adminLogin] User role:', user?.role);

    if (!user) {
      return res.status(200).json({
        responseCode: 401,
        error: 'Invalid credentials. Check your email/phone and password.',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      responseCode: 200,
      token,
      message: 'Admin logged in successfully',
    });
  } catch (error) {
    console.error('[adminLogin] Error:', error);
    res.status(200).json({ responseCode: 401, error: 'Failed to log in' });
  }
};