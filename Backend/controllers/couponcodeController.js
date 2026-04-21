const Coupon = require("../models/couponcode");
const generateCouponCode = require("../middleware/couponGenerator");

// ✅ Create Coupon (auto-generate code if not provided)
exports.createCoupon = async (req, res) => {
  try {
    let { code, type, value, expiryDate } = req.body;

    // If user didn’t send a code, generate automatically
    if (!code) {
      code = generateCouponCode(8); // 8-char random code
    }

    const coupon = new Coupon({
      code,
      type,
      value,
      expiryDate,
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
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Error fetching coupons", error });
  }
};

// ✅ Get coupon by code
exports.getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await Coupon.findOne({ code, active: true });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found or inactive" });
    }

    // Expired?
    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Error fetching coupon", error });
  }
};

// ✅ Apply coupon
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code, active: true });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found or inactive" });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (amount * coupon.value) / 100;
    } else if (coupon.type === "flat") {
      discount = coupon.value;
    }

    const finalAmount = amount - discount;

    res.json({
      message: "Coupon applied successfully",
      discount,
      finalAmount,
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
