const mongoose = require("mongoose");

const couponUsageSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SpecialCoupon",
      default: null,
    },
    couponCode:     { type: String, required: true, uppercase: true, trim: true },
    userName:       { type: String, required: true, trim: true },
    userEmail:      { type: String, required: true, trim: true, lowercase: true },
    userPhone:      { type: String, default: "" },
    discountType:   { type: String, enum: ["percentage", "flat", ""], default: "" },
    discountValue:  { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    orderAmount:    { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Used", "Active", "Expired", "Inactive"],
      default: "Used",
    },
    source: {
      type: String,
      // "frontend" = user applied SA coupon on website
      // "admin"    = superadmin added manually
      // "order"    = derived from an order with a regular admin coupon (virtual, not stored)
      enum: ["frontend", "admin", "order"],
      default: "frontend",
    },
    usedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CouponUsage", couponUsageSchema);