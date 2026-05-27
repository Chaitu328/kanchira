const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const User = require('../models/user');
// CREATE: POST /api/reviews

exports.addReview = async (req, res) => {
  try {
    const { productId, userId, rating, text, tags, images } = req.body;

    const review = new Review({
      productId,
      userId,
      rating,
      text,
      tags,
      images
    });

    await review.save();
    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
// Get reviews for a specific product and populate user's name
exports.getReview = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.body.productId })
      .populate('userId', 'name')       // populate user name & email from 'user' model
      .populate('productId', 'name')     // populate product name & slug from 'Product' model
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name')       // populate user name & email from 'user' model
      .populate('productId', 'name')     // populate product name & slug from 'Product' model
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Reviews fetched successfully',
      data: reviews
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// UPDATE: PUT /api/review/update/:id
exports.updateReview = async (req, res) => {
  try {
    // ✅ Read id from URL param and ensure it is a plain string
    const raw = req.params.id || req.body._id;
    const id  = raw && typeof raw === 'object' ? String(raw) : raw;

    if (!id || id === '[object Object]') {
      return res.status(400).json({ message: 'Invalid review id' });
    }

    const { rating, text, tags, images } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { rating, text, tags, images },
      { new: true }
    );

    if (!updatedReview) return res.status(404).json({ message: 'Review not found' });

    res.status(200).json({ message: 'Review updated', review: updatedReview });
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE: DELETE /api/review/delete/:id
exports.deleteReview = async (req, res) => {
  try {
    // ✅ Read id from URL param (DELETE requests may have no body)
    const id = req.params.id || req.body?._id;
    const review = await Review.findByIdAndDelete(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    res.status(200).json({ responseCode: 200, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Server error' });
  }
}