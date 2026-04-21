// routes/wishlistRoutes.js
const express = require('express');
const Wishlist = require('../models/wishlist');

// Add to wishlist
exports.AddWishlist = async (req, res) => {
  const { productId, userId } = req.body;
  const exists = await Wishlist.findOne({ userId, productId });
  if (exists) return res.status(200).json({ message: 'Already in wishlist' });
  const wishlistItem = new Wishlist({ userId, productId });
  await wishlistItem.save();
  res.status(201).json({ message: 'Added to wishlist', item: wishlistItem });
}

// Remove from wishlist
exports.removeWishlist = async (req, res) => {
  const { wishlistId } = req.body;

  await Wishlist.findOneAndDelete({ _id: wishlistId });
  res.status(200).json({ message: 'Removed from wishlist' });
}

// Get user's wishlist
exports.AllWishlist = async (req, res) => {
  const { userId } = req.body;
  const wishlist = await Wishlist.find({ userId }).populate('productId');
  res.status(200).json(wishlist);
}
// // Check if product is in wishlist
// exports.router.get('/check/:productId', auth, async (req, res) => {
//   const userId = req.user.id;
//   const { productId } = req.params;

//   const exists = await Wishlist.findOne({ userId, productId });
//   res.status(200).json({ isInWishlist: !!exists });
// });

