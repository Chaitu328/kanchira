const mongoose = require('mongoose');

// Define the schema for a menu item
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: { type: String, unique: true },

  image: {
    type: String,
    default: '', // URL to an image if needed
  },
  description: {
    type: String,
    default: ""
  },
  available: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Create the model from the schema,
const Categories = mongoose.model('categories', categorySchema);

module.exports = Categories;
