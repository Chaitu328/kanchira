const Order         = require("../models/order");
const Coupon        = require("../models/couponcode");
const User          = require("../models/user");
const SpecialCoupon = require("../superadmin/models/SpecialCoupon");

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json({ responseCode: 200, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id || !status)
      return res.status(400).json({ error: "Order ID and status are required" });

    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated)
      return res.status(404).json({ error: "Order not found" });

    res.status(200).json({ message: "Order status updated successfully", order: updated });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

exports.getOrderCouponUsages = async (req, res) => {
  try {
    const orders = await Order.find({
      couponCode: { $exists: true, $ne: "" },
    }).sort({ createdAt: -1 });

    if (orders.length === 0)
      return res.status(200).json({ responseCode: 200, usages: [] });

    const allCodes = [...new Set(
      orders.map((o) => (o.couponCode || "").toUpperCase()).filter(Boolean)
    )];

    const [adminCoupons, specialCoupons, users] = await Promise.all([
      Coupon.find({ code: { $in: allCodes } }).populate("adminId", "name email phone"),
      SpecialCoupon.find({ code: { $in: allCodes } }).populate("createdBy", "name email phone"),
      User.find(
        { _id: { $in: [...new Set(orders.map((o) => o.userId).filter(Boolean))] } },
        "name email phone"
      ),
    ]);

    const adminCouponMap = {};
    adminCoupons.forEach((c) => { adminCouponMap[c.code.toUpperCase()] = c; });

    const specialCouponMap = {};
    specialCoupons.forEach((c) => { specialCouponMap[c.code.toUpperCase()] = c; });

    const userMap = {};
    users.forEach((u) => { userMap[String(u._id)] = u; });

    const usages = orders.map((o) => {
      const code = (o.couponCode || "").toUpperCase();
      const user = userMap[String(o.userId)] || null;

      let createdByAdmin = null;
      let createdByType  = "admin"; // default

      // Level 1: snapshot on order (new orders after the fix)
      if (o.couponCreatedBy?.adminName) {
        createdByAdmin = {
          _id:   o.couponCreatedBy.adminId,
          name:  o.couponCreatedBy.adminName,
          email: o.couponCreatedBy.adminEmail || "",
          phone: o.couponCreatedBy.adminPhone || "",
        };
        createdByType = "admin";
      }

      // Level 2: live admin coupon lookup
      if (!createdByAdmin) {
        const ac = adminCouponMap[code];
        if (ac?.adminId) {
          createdByAdmin = {
            _id:   ac.adminId._id,
            name:  ac.adminId.name  || "",
            email: ac.adminId.email || "",
            phone: ac.adminId.phone || "",
          };
          createdByType = "admin";
        }
      }

      // Level 3: SA special coupon fallback (admin coupon deleted)
      if (!createdByAdmin) {
        const sc = specialCouponMap[code];
        if (sc?.createdBy) {
          createdByAdmin = {
            _id:   sc.createdBy._id,
            name:  sc.createdBy.name  || "SuperAdmin",
            email: sc.createdBy.email || "",
            phone: sc.createdBy.phone || "",
          };
          createdByType = "superadmin"; // ← tells frontend to show "SA Coupon"
        }
      }

      return {
        _id:            o._id,
        source:         "order",
        couponCode:     code,
        userName:       o.address?.fullName || user?.name  || "Unknown User",
        userEmail:      user?.email  || "",
        userPhone:      user?.phone  || o.address?.phone || "",
        discountAmount: o.couponDiscount || 0,
        discountValue:  0,
        orderAmount:    o.totalAmount    || 0,
        status:         "Used",
        usedAt:         o.createdAt,
        createdByAdmin,
        createdByType,  // "admin" | "superadmin"
      };
    });

    res.status(200).json({ responseCode: 200, usages });
  } catch (error) {
    console.error("Error fetching order coupon usages:", error);
    res.status(500).json({ error: "Failed to fetch order coupon usages" });
  }
};