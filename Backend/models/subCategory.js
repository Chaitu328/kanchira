const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, default: "" },
    icon: { type: String, default: "" },
    isTrending: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    available: { type: Boolean, default: true }, // ✅ ADDED
  },
  { timestamps: true },
);

module.exports = mongoose.model("SubCategory", subCategorySchema);
