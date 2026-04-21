// controllers/cartController.js

const Cart = require('../models/cart');

// exports.addToCart = async (req, res) => {
//   const { productId, userId } = req.body;
//   const exists = await Cart.findOne({ userId, productId });
//   if (exists) return res.status(200).json({ message: 'Already in cart' });
//   const cartItem = new Cart({ userId, productId });
//   await cartItem.save();
//   res.status(201).json({ message: 'Added to cartlist', item: cartItem });
// }

exports.addToCart = async (req, res) => {
  try {
    const { userId, items } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items });
    } else {
      items.forEach((newItem) => {
        const existingItem = cart.items.find(item =>
          item.productId.toString() === newItem.productId &&
          JSON.stringify(item.variant) === JSON.stringify(newItem.variant)
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
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

exports.getCart = async (req, res) => {
  try {
    const { userId } = req.body; // 👈 you are sending { userId } in POST body

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
// exports.getCart = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     // const userId = req.query.userId; // instead of req.body
//     const cart = await Cart.findOne({ userId }).populate('productId');
//     if (!cart) {
//       return res.status(400).json({
//         message: 'cart item not found'
//       });
//     }
//     res.status(200).json({
//       message: 'cart items successfully fetched',
//       data: cart
//     });


//     // // Prepare a clean response with variant + product details
//     // const formattedItems = cart.items.map((item) => ({
//     //   _id: item._id,
//     //   productId: item.productId ? {
//     //     _id: item.productId._id,
//     //     name: item.productId.name,
//     //     brand: item.productId.brand || '',
//     //     image: item.productId.image || '',
//     //     price: item.productId.price,
//     //     originalPrice: item.productId.originalPrice || '',
//     //     discount: item.productId.discount || '',
//     //     stock: item.productId.stock || 0,
//     //     // Add other product fields if needed
//     //   } : null,
//     //   quantity: item.quantity,
//     //   variant: item.variant || {},
//     // }));

//     // res.status(200).json({
//     //   cart: {
//     //     _id: cart._id,
//     //     userId: cart.userId,
//     //     items: formattedItems,
//     //   },
//     // });


//   } catch (error) {
//     console.error('Get Cart Error:', error);
//     res.status(500).json({ error: 'Failed to fetch cart' });
//   }
// };



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

    // Remove the matching item based on productId and variant match
    cart.items = cart.items.filter(item => {
      const isSameProduct = item.productId.toString() === productId;
      // fetch the variant object from the item and compare it with the fabric object from the request body
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



// exports.removeItemCart = async (req, res) => {
//   try {
//     const { userId, productId, variant } = req.body;

//     const cart = await Cart.findOne({ userId });
//     if (!cart) return res.status(404).json({ error: 'Cart not found' });

//     cart.items = cart.items.filter(item =>
//       item.productId.toString() !== productId ||
//       JSON.stringify(item.variant) !== JSON.stringify(variant)
//     );
//     await cart.save();
//     res.status(200).json({ message: 'Item removed', cart });
//   } catch (error) {
//     console.error('Remove Item Error:', error);
//     res.status(500).json({ error: 'Failed to remove item' });
//   }
// };


exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

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
    // Respond with the menu items
    res.status(200).json(getCart);
  } catch (error) {
    console.error('Error fetching menu items:', error);

    // Respond with a 500 error in case of failure
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
}