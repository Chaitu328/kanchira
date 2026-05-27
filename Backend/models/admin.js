const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name:     { type: String },
  email:    { type: String },
  phone:    { type: String, required: true },
  password: { type: String, required: true },
  role:     { type: String, default: 'admin' },  // ADDED — isAdmin middleware needs this
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;