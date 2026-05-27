const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    address: {
      _id: { type: mongoose.Schema.Types.Mixed },
      userId: { type: String },
      fullName: { type: String },
      houseNumber: { type: String },
      currentAddress: { type: String },
      city: { type: String },
      district: { type: String },
      state: { type: String },
      pincode: { type: String },
      phone: { type: String },
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, default: "" },
        image: { type: String, default: "" },
        variant: {
          color: { type: String, default: "" },
          size: { type: String, default: "" },
          fabric: { type: String, default: "" },
          price: { type: Number, default: 0 },
          discountPercentage: { type: Number, default: 0 },
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        discountPercentage: { type: Number, default: 0 },
        finalPrice: { type: Number, default: 0 },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    spinDiscount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    couponDiscount: { type: Number, default: 0 },
    festivalDiscount: { type: Number, default: 0 },

    // ── Snapshot of who created the coupon at order time ──────────
    // Stored so it's never lost even if the coupon is later deleted.
    couponCreatedBy: {
      adminId:   { type: mongoose.Schema.Types.ObjectId, default: null },
      adminName: { type: String, default: "" },
      adminEmail:{ type: String, default: "" },
      adminPhone:{ type: String, default: "" },
    },

    paymentMethod: {
      type: String,
      default: "COD",
    },

    paymentStatus: {
      type: String,
      default: "Pending",
    },

    merchantTransactionId: { type: String, default: "" },
    phonepeRedirectUrl: { type: String, default: "" },

    orderType: {
      type: String,
      default: "cart",
    },

    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", OrderSchema);