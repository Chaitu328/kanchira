const Cart = require('../models/cart');
const mongoose = require('mongoose');

exports.addToCart = async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'userId and items are required' });
    }

    // ✅ FIX: sanitize each item — cast productId to ObjectId, coerce variant fields to String
    const sanitizedItems = items.map(item => ({
      productId: new mongoose.Types.ObjectId(item.productId),
      image: item.image || '',
      variant: {
        color:              String(item.variant?.color              ?? ''),
        size:               String(item.variant?.size               ?? ''),
        material:           String(item.variant?.material           ?? ''),
        price:              String(item.variant?.price              ?? ''),
        storage:            String(item.variant?.storage            ?? ''),
        fabric:             String(item.variant?.fabric             ?? ''),
        discountPercentage: String(item.variant?.discountPercentage ?? ''),
        rating:             String(item.variant?.rating             ?? ''),
      },
      quantity: Number(item.quantity) || 1,
    }));

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: sanitizedItems });
    } else {
      sanitizedItems.forEach((newItem) => {
        const existingItem = cart.items.find(item =>
          item.productId?.toString() === newItem.productId.toString() &&
          item.variant?.size === newItem.variant.size &&
          item.variant?.color === newItem.variant.color
        );

        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          cart.items.push(newItem);
        }
      });
    }

    await cart.save();
    res.status(201).json({ message: 'Cart updated successfully', cart });
  } catch (error) {
    console.error('Add to Cart Error:', error);
    res.status(500).json({ error: 'Failed to add to cart', detail: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    // ✅ FIX: route is GET /cart/:userId — read from req.params, not req.body
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      return res.status(200).json({
        cart: {
          userId,
          items: [],
        },
      });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { userId, productId, variant, quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.find(item =>
      item.productId.toString() === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (item) {
      item.quantity = quantity;
      await cart.save();
      res.status(200).json({ message: 'Quantity updated', cart });
    } else {
      res.status(404).json({ error: 'Item not found in cart' });
    }
  } catch (error) {
    console.error('Update Quantity Error:', error);
    res.status(500).json({ error: 'Failed to update quantity' });
  }
};

exports.removeItemCart = async (req, res) => {
  try {
    const { userId, productId, variant } = req.body;

    if (!userId || !productId || !variant) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => {
      const isSameProduct = item.productId.toString() === productId;
      const isSameVariant = JSON.stringify(item.variant.fabric || {}) === JSON.stringify(variant.fabric || {});
      return !(isSameProduct && isSameVariant);
    });

    await cart.save();
    res.status(200).json({ message: 'Item removed successfully', cart });
  } catch (error) {
    console.error({ msg: 'Remove Item Error:', error: error.message });
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    // ✅ FIX: route is DELETE /cart/clear/:userId — read from req.params, not req.body
    const userId = req.params.userId;

    await Cart.findOneAndUpdate({ userId }, { items: [] });
    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear Cart Error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

exports.getAllCartData = async (req, res) => {
  try {
    const getCart = await Cart.find();
    res.status(200).json(getCart);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};