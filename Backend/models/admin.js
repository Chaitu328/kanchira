const mongoose = require('mongoose');

// User Schema
const adminSchema = new mongoose.Schema({

  name: { type: String },
  email: { type: String },
  phone: {
    type: String, require: true
  },
  password: { type: String, require: true },
  
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin; // Ensure you're exporting the correct model
