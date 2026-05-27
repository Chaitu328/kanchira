const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * SuperAdmin Schema
 * Has role: 'superadmin' and inherits all admin permissions
 * plus exclusive access to SpecialCoupon management
 */
const superAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      default: "superadmin",
      immutable: true, // role cannot be changed after creation
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Refresh token stored for token rotation
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Pre-save hook: Hash password before saving
superAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method: Compare plain password with hashed
superAdminSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);
module.exports = SuperAdmin;
