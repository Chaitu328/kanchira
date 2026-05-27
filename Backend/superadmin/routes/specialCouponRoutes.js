const express = require("express");
const router  = express.Router();

const couponController = require("../controllers/specialCouponController");
const { verifyJWT, isSuperAdmin } = require("../middleware/authMiddleware");
const { validateCoupon }          = require("../middleware/validate");

// ── Public routes — NO auth (main website calls these) ───────────
router.post("/validate", couponController.validateCoupon);
router.post("/use",      couponController.useCoupon);

// ── Super Admin protected routes ─────────────────────────────────
router.use(verifyJWT, isSuperAdmin);

// Used-coupon management — MUST be before /:id to avoid route conflict
router.get("/used",        couponController.getUsedCoupons);
router.post("/used",       couponController.addUsedCoupon);
router.put("/used/:id",    couponController.updateUsedCoupon);
router.delete("/used/:id", couponController.deleteUsedCoupon);

// Special coupon CRUD
router.post("/",    validateCoupon, couponController.createCoupon);
router.get("/",     couponController.getCoupons);
router.get("/:id",  couponController.getCouponById);
router.put("/:id",  couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);

module.exports = router;