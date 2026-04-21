// models/cart.js
const mongoose = require('mongoose');

const wishListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishListSchema);
