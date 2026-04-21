const mongoose = require('mongoose');

const subSubCategorySchema = new mongoose.Schema({
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true,
    },
      categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'categories',
      required: true,
    },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, default: '' },
    productCount: { type: Number, default: 0 },
    totalProductCount: { type: Number, default: 0 },
    isNewArrival: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  }, { timestamps: true });
  
  module.exports = mongoose.model('SubSubCategory', subSubCategorySchema);
  