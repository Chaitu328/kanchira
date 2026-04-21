const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken, validateCredentials } = require("../middleware/authMiddleware");

exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!password) {
      return res.status(200).json({
        responseCode: 401,
        message: 'Password  is required',
      });
    }
    if (!phone) {
      return res.status(200).json({
        responseCode: 401,
        message: 'Phone  is required',
      });
    }

    const existingTable = await Admin.findOne({ phone, email });

    if (existingTable) {
      return res.status(200).json({
        responseCode: 401,
        message: 'Phone already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Admin({ name, email, password: hashedPassword, phone });
    await user.save();

    res.status(201).json({ responseCode: 201, message: "registered successfully" });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register Member' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    const user = await validateCredentials(email, password);
    console.log(user);
    if (!user) {
      return res.status(200).json({ responseCode: 401, error: 'Invalid credentials or not an admin' });
    }

    const token = generateToken(user);
    res.status(200).json({ responseCode: 200, token, message: 'Admin logged in successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(200).json({ responseCode: 401, error: 'Failed to log in' });
  }
};
