const SpecialCoupon = require("../models/SpecialCoupon");
const Order = require("../../models/order");

/**
 * Create a new special coupon
 */
const createCoupon = async (couponData, superAdminId) => {
  // Check if coupon code already exists
  const existing = await SpecialCoupon.findOne({ code: couponData.code.toUpperCase() });
  if (existing) {
    throw { status: 409, message: `Coupon code '${couponData.code}' already exists` };
  }

  // Validate expiry date is in the future
  if (new Date(couponData.expiryDate) <= new Date()) {
    throw { status: 400, message: "Expiry date must be in the future" };
  }

  const coupon = await SpecialCoupon.create({
    ...couponData,
    code: couponData.code.toUpperCase(),
    createdBy: superAdminId,
  });

  return coupon;
};

/**
 * Get all special coupons with optional filters
 */
const getCoupons = async ({ page = 1, limit = 10, isActive, search } = {}) => {
  const query = {};

  if (isActive !== undefined) query.isActive = isActive === "true";
  if (search) query.code = { $regex: search, $options: "i" };

  const skip = (page - 1) * limit;

  const [coupons, total] = await Promise.all([
    SpecialCoupon.find(query)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    SpecialCoupon.countDocuments(query),
  ]);

  const orders = await Order.find({
    couponCode: { $exists: true, $ne: "" },
    status: { $nin: ["Cancelled", "Returned", "Refunded", "cancelled", "returned", "refunded"] }
  });

  const couponTotalMap = {};
  orders.forEach(order => {
    const code = (order.couponCode || "").trim().toUpperCase();
    if (code) {
      if (!couponTotalMap[code]) couponTotalMap[code] = 0;
      couponTotalMap[code] += (Number(order.totalAmount) || 0);
    }
  });

  const couponsWithTotal = coupons.map(c => {
    const code = (c.code || "").trim().toUpperCase();
    const totalAmountUsed = couponTotalMap[code] || 0;
    const obj = c.toObject ? c.toObject() : c;
    return { ...obj, totalAmountUsed };
  });

  return {
    coupons: couponsWithTotal,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single coupon by ID
 */
const getCouponById = async (couponId) => {
  const coupon = await SpecialCoupon.findById(couponId)
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");

  if (!coupon) throw { status: 404, message: "Special coupon not found" };
  return coupon;
};

/**
 * Update a special coupon
 */
const updateCoupon = async (couponId, updateData, superAdminId) => {
  const coupon = await SpecialCoupon.findById(couponId);
  if (!coupon) throw { status: 404, message: "Special coupon not found" };

  // Prevent changing the coupon code to an already-existing one
  if (updateData.code) {
    const codeConflict = await SpecialCoupon.findOne({
      code: updateData.code.toUpperCase(),
      _id: { $ne: couponId },
    });
    if (codeConflict) {
      throw { status: 409, message: `Coupon code '${updateData.code}' already exists` };
    }
    updateData.code = updateData.code.toUpperCase();
  }

  if (updateData.expiryDate && new Date(updateData.expiryDate) <= new Date()) {
    throw { status: 400, message: "Expiry date must be in the future" };
  }

  const updated = await SpecialCoupon.findByIdAndUpdate(
    couponId,
    { ...updateData, updatedBy: superAdminId },
    { new: true, runValidators: true }
  ).populate("createdBy updatedBy", "name email");

  return updated;
};

/**
 * Delete a special coupon
 */
const deleteCoupon = async (couponId) => {
  const coupon = await SpecialCoupon.findByIdAndDelete(couponId);
  if (!coupon) throw { status: 404, message: "Special coupon not found" };
  return { message: "Special coupon deleted successfully" };
};

module.exports = { createCoupon, getCoupons, getCouponById, updateCoupon, deleteCoupon };
