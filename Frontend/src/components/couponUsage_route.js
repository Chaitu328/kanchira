// const express = require('express');
// const router = express.Router();
// const CouponUsage = require('../models/CouponUsage');

// // POST /api/coupon/usage — Record coupon usage after payment
// router.post('/usage', async (req, res) => {
//   try {
//     const {
//       userName,
//       userEmail,
//       userPhone,
//       superCouponCode,
//       adminCouponCode,
//       discountAmount,
//       discountPercent,
//       orderId,
//       source
//     } = req.body;

//     const usage = new CouponUsage({
//       userName: userName || '',
//       userEmail: userEmail || '',
//       userPhone: userPhone || '',
//       superCouponCode: superCouponCode || '',
//       adminCouponCode: adminCouponCode || '',
//       discountAmount: discountAmount || 0,
//       discountPercent: discountPercent || '',
//       orderId: orderId || '',
//       source: source || 'frontend',
//       status: 'Used',
//       usedAt: new Date()
//     });

//     await usage.save();

//     res.status(201).json({
//       success: true,
//       message: 'Coupon usage recorded successfully',
//       data: usage
//     });
//   } catch (err) {
//     console.error('Error recording coupon usage:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // GET /api/superadmin/coupons/used — Get all used coupons (Super Admin)
// router.get('/superadmin/coupons/used', async (req, res) => {
//   try {
//     const usages = await CouponUsage.find().sort({ usedAt: -1 });
//     res.json({ 
//       success: true, 
//       coupons: usages,
//       count: usages.length 
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;