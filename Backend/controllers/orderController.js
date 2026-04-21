const { getPhonePeProdToken } = require("../middleware/payment");
const axios = require("axios");
const Order = require("../models/order");

// ═══════════════════════════════════════════════════════════════
// CREATE PAYMENT / PLACE ORDER
// Handles both COD (saves order directly) and Online (PhonePe)
// ═══════════════════════════════════════════════════════════════
exports.createPayment = async (req, res) => {
  try {
    const {
      userId,
      address,
      items,
      totalAmount,
      spinDiscount,
      couponCode,
      couponDiscount,
      festivalDiscount,
      paymentMethod,
      orderType,
    } = req.body;

    if (!userId)
      return res.status(400).json({ responseCode: 400, message: "userId is required." });
    if (!address)
      return res.status(400).json({ responseCode: 400, message: "Delivery address is required." });
    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ responseCode: 400, message: "Order items are required." });
    if (!totalAmount || totalAmount <= 0)
      return res.status(400).json({ responseCode: 400, message: "Invalid total amount." });

    // ── COD — save order immediately ─────────────────────────────
    if (!paymentMethod || paymentMethod === "COD") {
      const order = new Order({
        userId,
        address,
        items,
        totalAmount,
        spinDiscount: spinDiscount || 0,
        couponCode: couponCode || "",
        couponDiscount: couponDiscount || 0,
        festivalDiscount: festivalDiscount || 0,
        paymentMethod: "COD",
        paymentStatus: "Pending",
        orderType: orderType || "cart",
        status: "Pending",
      });

      const savedOrder = await order.save();

      return res.status(200).json({
        responseCode: 200,
        message: "Order placed successfully!",
        order: savedOrder,
      });
    }

    // ── ONLINE (PhonePe) — initiate payment ──────────────────────
    const merchantTransactionId = `ORD${Date.now()}`;

    const paymentData = {
      merchantOrderId: merchantTransactionId,
      amount: totalAmount * 100,
      expireAfter: 1200,
      metaInfo: { totalAmount },
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "Payment for your order",
        merchantUrls: {
          redirectUrl: `${process.env.FRONTEND_URL}/payment_callback?code=PAYMENT_SUCCESS`,
          failureUrl: `${process.env.FRONTEND_URL}/payment_callback?code=PAYMENT_FAILED`,
          cancelUrl: `${process.env.FRONTEND_URL}/payment_callback?code=PAYMENT_FAILED`,
        },
      },
    };

    const authToken = await getPhonePeProdToken();
    if (!authToken)
      return res.status(400).json({ responseCode: 400, message: "Auth token not found." });

    const paymentOptions = {
      method: "post",
      url: "https://api.phonepe.com/apis/pg/checkout/v2/pay",
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${authToken}`,
      },
      data: paymentData,
    };

    const paymentResponse = await axios.request(paymentOptions);
    const redirectUrlPhonepe = paymentResponse.data.redirectUrl;

    if (!redirectUrlPhonepe)
      return res.status(400).json({ responseCode: 400, message: "Redirect URL not found." });

    if (
      paymentResponse.data.state === "FAILED" ||
      paymentResponse.data.state === "CANCELLED"
    ) {
      return res.status(400).json({ responseCode: 400, message: "Transaction failed. Try again." });
    }

    const order = new Order({
      userId,
      address,
      items,
      totalAmount,
      spinDiscount: spinDiscount || 0,
      couponCode: couponCode || "",
      couponDiscount: couponDiscount || 0,
      festivalDiscount: festivalDiscount || 0,
      paymentMethod: "ONLINE",
      paymentStatus: "Pending",
      merchantTransactionId,
      phonepeRedirectUrl: redirectUrlPhonepe,
      orderType: orderType || "cart",
      status: "Pending",
    });

    await order.save();

    return res.status(200).json({
      msg: "OK",
      redirectUrlRes: redirectUrlPhonepe,
      merchantTransactionId,
      totalAmount,
    });
  } catch (error) {
    console.error("Error in createPayment:", error?.response?.data || error.message);
    res.status(500).json({
      error: "Failed to place order",
      message: error?.response?.data?.message || error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// VERIFY PAYMENT (PhonePe callback — marks order as Paid)
// ═══════════════════════════════════════════════════════════════
exports.verifyPayment = async (req, res) => {
  try {
    const { merchantOrderId } = req.body;

    if (!merchantOrderId)
      return res.status(400).json({ responseCode: 400, message: "merchantOrderId is required." });

    const authToken = await getPhonePeProdToken();
    if (!authToken)
      return res.status(400).json({ responseCode: 400, message: "Auth token not found." });

    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://api.phonepe.com/apis/pg/checkout/v2/order/${merchantOrderId}/status?details=false`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${authToken}`,
      },
    };

    const paymentResponse = await axios.request(config);
    const state = paymentResponse.data.state;

    if (state === "COMPLETED") {
      await Order.findOneAndUpdate(
        { merchantTransactionId: merchantOrderId },
        { paymentStatus: "Paid", status: "Confirmed" }
      );
    } else if (state === "FAILED" || state === "CANCELLED") {
      await Order.findOneAndUpdate(
        { merchantTransactionId: merchantOrderId },
        { paymentStatus: "Failed", status: "Cancelled" }
      );
    }

    res.status(200).json({
      responseCode: 200,
      message: "Payment verification successful",
      paymentData: paymentResponse.data,
    });
  } catch (error) {
    console.error("Error in verifyPayment:", error?.response?.data || error.message);
    res.status(500).json({
      error: "Failed to verify payment",
      msg: error?.response?.data?.message || error.message,
      details: error?.response?.data || {},
    });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET ORDERS BY USER ID
// ═══════════════════════════════════════════════════════════════
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId)
      return res.status(400).json({ responseCode: 400, message: "userId is required." });

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      responseCode: 200,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ responseCode: 500, message: "Failed to fetch orders." });
  }
};

// ═══════════════════════════════════════════════════════════════
// GET STATS — Total Orders & Total Sales (ALL orders, any status)
// GET /getStats
// ═══════════════════════════════════════════════════════════════
exports.getStats = async (req, res) => {
  try {
    const orders = await Order.find({});
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    res.status(200).json({ responseCode: 200, totalOrders, totalSales });
  } catch (error) {
    console.error("Error in getStats:", error.message);
    res.status(500).json({ responseCode: 500, message: "Failed to fetch stats." });
  }
};