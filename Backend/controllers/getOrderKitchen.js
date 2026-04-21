const Order = require("../models/order");

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json({ responseCode: 200, orders: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id || !status) {
      return res
        .status(400)
        .json({ error: "Order ID and status are required" });
    }
    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }
    res
      .status(200)
      .json({ message: "Order status updated successfully", order: updated });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};
