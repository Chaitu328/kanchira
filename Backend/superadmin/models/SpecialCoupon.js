const mongoose = require("mongoose");

/**
 * SpecialCoupon Schema
 * Exclusive to Super Admin — normal admins cannot access these
 */
const specialCouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: [true, "Discount type is required"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value must be positive"],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Min order amount must be positive"],
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // null = no cap on discount
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    // Track who created / last updated this coupon
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      default: null,
    },
  },
  { timestamps: true }
);

// Virtual: check if coupon is expired
specialCouponSchema.virtual("isExpired").get(function () {
  return this.expiryDate < new Date();
});

const SpecialCoupon = mongoose.model("SpecialCoupon", specialCouponSchema);
module.exports = SpecialCoupon;
