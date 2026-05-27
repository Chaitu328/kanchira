const CouponUsage   = require("../models/CouponUsage");
const SpecialCoupon = require("../models/SpecialCoupon");

// Validate coupon code — called from main website before placing order
const validateCoupon = async (code, orderAmount = 0, userEmail = "") => {
  let coupon;
  try {
    coupon = await SpecialCoupon.findOne({ code: code.toUpperCase(), isActive: true });
  } catch (dbErr) {
    throw { status: 500, message: "Database error while validating coupon" };
  }

  if (!coupon) throw { status: 404, message: "Coupon not found or inactive" };

  if (coupon.expiryDate && coupon.expiryDate < new Date()) {
    throw { status: 400, message: "Coupon has expired" };
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw { status: 400, message: "Coupon usage limit reached" };
  }

  if (orderAmount < (coupon.minOrderAmount || 0)) {
    throw { status: 400, message: `Minimum order amount of ₹${coupon.minOrderAmount} required` };
  }

  // ── FIX BUG 3: per-user reuse check for SA coupons ───────────────
  if (userEmail) {
    const previousUse = await CouponUsage.findOne({
      couponCode: code.toUpperCase(),
      userEmail:  userEmail.toLowerCase().trim(),
    });
    if (previousUse) {
      throw { status: 400, message: "You have already used this coupon" };
    }
  }

  let discountAmount =
    coupon.discountType === "percentage"
      ? (orderAmount * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount !== undefined) {
    discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
  }

  discountAmount = Math.min(discountAmount, orderAmount);

  return {
    couponId:      coupon._id,
    code:          coupon.code,
    description:   coupon.description,
    discountType:  coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    finalAmount:   orderAmount - discountAmount,
  };
};

// Record usage after order is placed — from main website
const recordUsage = async (data) => {
  const { couponId, couponCode, userName, userEmail, userPhone,
          discountType, discountValue, discountAmount, orderAmount } = data;

  if (couponId) {
    await SpecialCoupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
  }
  return await CouponUsage.create({
    couponId: couponId || null,
    couponCode: couponCode.toUpperCase(),
    userName, userEmail, userPhone,
    discountType:   discountType   || "",
    discountValue:  discountValue  || 0,
    discountAmount: discountAmount || 0,
    orderAmount:    orderAmount    || 0,
    source: "frontend",
  });
};

// Get all used coupons — admin panel
const getUsedCoupons = async ({ page = 1, limit = 20, search } = {}) => {
  const query = {};
  if (search) {
    query.$or = [
      { userName:   { $regex: search, $options: "i" } },
      { userEmail:  { $regex: search, $options: "i" } },
      { couponCode: { $regex: search, $options: "i" } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [usages, total] = await Promise.all([
    CouponUsage.find(query)
      .populate("couponId", "code description discountType discountValue")
      .sort({ usedAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    CouponUsage.countDocuments(query),
  ]);
  return {
    usages,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
};

// Manually add a usage record — admin panel
const addUsedCoupon = async (data) => {
  const coupon = await SpecialCoupon.findOne({ code: (data.couponCode || "").toUpperCase() });
  const usage = await CouponUsage.create({
    couponId:       coupon ? coupon._id : null,
    couponCode:     (data.couponCode || "").toUpperCase(),
    userName:       data.userName,
    userEmail:      data.userEmail,
    userPhone:      data.userPhone      || "",
    discountType:   data.discountType   || "",
    discountValue:  data.discountValue  || 0,
    discountAmount: Number(data.discountAmount) || 0,
    orderAmount:    Number(data.orderAmount)    || 0,
    status:         data.status || "Used",
    source:         "admin",
  });
  if (coupon) {
    await SpecialCoupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
  }
  return usage;
};

// Update a usage record — admin panel
const updateUsedCoupon = async (usageId, updateData) => {
  const usage = await CouponUsage.findByIdAndUpdate(usageId, updateData, {
    new: true, runValidators: true,
  });
  if (!usage) throw { status: 404, message: "Usage record not found" };
  return usage;
};

// Delete a usage record — admin panel
const deleteUsedCoupon = async (usageId) => {
  const usage = await CouponUsage.findByIdAndDelete(usageId);
  if (!usage) throw { status: 404, message: "Usage record not found" };
  if (usage.couponId) {
    await SpecialCoupon.findByIdAndUpdate(usage.couponId, { $inc: { usedCount: -1 } });
  }
  return { message: "Usage record deleted" };
};

module.exports = { validateCoupon, recordUsage, getUsedCoupons, addUsedCoupon, updateUsedCoupon, deleteUsedCoupon };