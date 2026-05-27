const couponService = require("../services/specialCouponService");
const usageService  = require("../services/couponUsageService");
const { successResponse, errorResponse } = require("../utils/responseHelper");

// ── Special Coupon CRUD ───────────────────────────────────────────

exports.createCoupon = async (req, res) => {
  try {
    const coupon = await couponService.createCoupon(req.body, req.superAdmin._id);
    return successResponse(res, "Special coupon created successfully", { coupon }, 201);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const result = await couponService.getCoupons(req.query);
    return successResponse(res, "Special coupons fetched successfully", result);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

exports.getCouponById = async (req, res) => {
  try {
    const coupon = await couponService.getCouponById(req.params.id);
    return successResponse(res, "Coupon fetched successfully", { coupon });
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await couponService.updateCoupon(req.params.id, req.body, req.superAdmin._id);
    return successResponse(res, "Special coupon updated successfully", { coupon });
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const result = await couponService.deleteCoupon(req.params.id);
    return successResponse(res, result.message);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

// ── Coupon Usage (Used Coupons) ───────────────────────────────────

// GET /superadmin/coupons/used  — list all usage records
exports.getUsedCoupons = async (req, res) => {
  try {
    const result = await usageService.getUsedCoupons(req.query);
    // Return as { data: usages } so admin UsedCoupons.js res.data.data works
    return successResponse(res, "Used coupons fetched successfully", { data: result.usages, pagination: result.pagination });
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

// POST /superadmin/coupons/used  — manually add a record
exports.addUsedCoupon = async (req, res) => {
  try {
    if (!req.body.couponCode) return errorResponse(res, "couponCode is required", 400);
    if (!req.body.userName)   return errorResponse(res, "userName is required",   400);
    if (!req.body.userEmail)  return errorResponse(res, "userEmail is required",  400);
    const usage = await usageService.addUsedCoupon(req.body);
    return successResponse(res, "Usage record added", { usage }, 201);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

// PUT /superadmin/coupons/used/:id
exports.updateUsedCoupon = async (req, res) => {
  try {
    const usage = await usageService.updateUsedCoupon(req.params.id, req.body);
    return successResponse(res, "Usage record updated", { usage });
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

// DELETE /superadmin/coupons/used/:id
exports.deleteUsedCoupon = async (req, res) => {
  try {
    const result = await usageService.deleteUsedCoupon(req.params.id);
    return successResponse(res, result.message);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

// ── Public routes (no auth — called from main website) ───────────

// POST /superadmin/coupons/validate  — validate before showing discount
// POST /superadmin/coupons/validate  — validate before showing discount
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount, userEmail } = req.body;  // ← accept userEmail
    if (!code) return errorResponse(res, "Coupon code is required", 400);

    const codeStr = typeof code === "object" ? (code.code || "") : String(code);
    if (!codeStr.trim()) return errorResponse(res, "Coupon code is required", 400);

    const result = await usageService.validateCoupon(
      codeStr.trim().toUpperCase(),
      Number(orderAmount) || 0,
      (userEmail || "").toLowerCase().trim()   // ← pass userEmail for per-user check
    );
    return successResponse(res, "Coupon applied successfully", result);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

// POST /superadmin/coupons/use  — record usage after order confirmed
exports.useCoupon = async (req, res) => {
  try {
    if (!req.body.couponCode) return errorResponse(res, "couponCode is required", 400);
    if (!req.body.userEmail)  return errorResponse(res, "userEmail is required",  400);
    const usage = await usageService.recordUsage(req.body);
    return successResponse(res, "Coupon usage recorded", { usage }, 201);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};