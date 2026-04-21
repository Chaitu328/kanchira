const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' }
}, { _id: false });

const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'One Size', 'None'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  left: {
    type: Number,
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  finalPrice: {
    type: Number,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { _id: true });

const variantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
    trim: true
  },
  colorCode: {
    type: String,
    default: ''
  },
  images: [imageSchema],
  sizes: [sizeSchema],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  }
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories',
    required: true
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory'
  },
  subsubcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubSubCategory'
  },
  brand: {
    type: String,
    index: true
  },
  tags: [{
    type: String,
    index: true
  }],
  speciality: {
    type: String,
    enum: ['Handloom', 'OrganicCotton', 'Designer', 'Premium', 'Budget', 'Electronics', 'None'],
    default: 'None'
  },
  image: {
    type: String,
    default: ''
  },
  galleryImages: [],
  variants: [variantSchema],
  available: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  metaTitle: String,
  metaDescription: String,
  discountPercentage: {
    type: Number,
    default: 0
  },
  url: String
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
