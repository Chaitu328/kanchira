const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  rating: { type: Number, required: true },
  text: { type: String, default: '' },
  tags: [String],
  images: [String], // store image URLs or filenames
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
