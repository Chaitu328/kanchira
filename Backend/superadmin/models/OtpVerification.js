const mongoose = require("mongoose");

/**
 * OtpVerification Schema
 * Stores OTPs for Super Admin forgot password flow
 * OTPs auto-expire via TTL index (5 minutes)
 */
const otpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: [5, "Maximum OTP attempts exceeded"],
    },
    // createdAt is used by TTL index — document auto-deletes after 5 minutes
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // 300 seconds = 5 minutes (MongoDB TTL)
    },
  }
);

// Compound index: one active OTP per email
otpVerificationSchema.index({ email: 1 });

const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema);
module.exports = OtpVerification;
