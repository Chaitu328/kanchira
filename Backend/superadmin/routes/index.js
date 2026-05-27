const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const specialCouponRoutes = require("./specialCouponRoutes");

// Mount sub-routes
router.use("/auth", authRoutes);
router.use("/coupons", specialCouponRoutes);

module.exports = router;
