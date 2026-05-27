const Coupon = require("../models/couponcode");
const Order  = require("../models/order");   // ← ADDED to check past usage
const Admin  = require("../models/admin");
const generateCouponCode = require("../middleware/couponGenerator");

// ✅ Create Coupon
exports.createCoupon = async (req, res) => {
  try {
    let { code, type, value, expiryDate } = req.body;
    if (!code) code = generateCouponCode(8);

    const coupon = new Coupon({
      code, type, value, expiryDate,
      adminId: req.user?.id || null,
    });
    await coupon.save();
    res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating coupon", error });
  }
};

// ✅ Get all coupons
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate("adminId", "name email phone")
      .sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Error fetching coupons", error });
  }
};

// ✅ Get coupon by code
exports.getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await Coupon.findOne({ code, active: true })
      .populate("adminId", "name email phone");

    if (!coupon) return res.status(404).json({ message: "Coupon not found or inactive" });
    if (new Date() > coupon.expiryDate) return res.status(400).json({ message: "Coupon expired" });

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Error fetching coupon", error });
  }
};

// ✅ Apply coupon — FIX BUG 3: block reuse by same user
exports.applyCoupon = async (req, res) => {
  try {
    const { code, amount, userId } = req.body;

    const coupon = await Coupon.findOne({ code, active: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found or inactive" });
    if (new Date() > coupon.expiryDate) return res.status(400).json({ message: "Coupon expired" });

    // ── Per-user reuse check ──────────────────────────────────────
    if (userId) {
      const alreadyUsed = await Order.findOne({
        userId,
        couponCode: code,
        status: { $nin: ["Cancelled"] },
      });
      if (alreadyUsed) {
        return res.status(400).json({ message: "You have already used this coupon" });
      }
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (amount * coupon.value) / 100;
    } else if (coupon.type === "flat") {
      discount = coupon.value;
    }
    discount = Math.min(discount, amount); // never exceed order total

    res.json({
      message: "Coupon applied successfully",
      discount,
      finalAmount: amount - discount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error applying coupon", error });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting coupon", error });
  }
};