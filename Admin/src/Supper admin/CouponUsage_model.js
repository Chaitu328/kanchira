const mongoose = require('mongoose');

const couponUsageSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: { type: String, default: '' },
  superCouponCode: { type: String, default: '' },
  adminCouponCode: { type: String, default: '' },
  discountAmount: { type: Number, default: 0 },
  discountPercent: { type: String, default: '' },
  orderId: { type: String, default: '' },
  status: { type: String, enum: ['Used', 'Active', 'Expired'], default: 'Used' },
  source: { type: String, enum: ['frontend', 'admin'], default: 'frontend' },
  usedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CouponUsage', couponUsageSchema);