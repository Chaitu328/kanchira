const subSubcategories = require("../models/sub-subcategories");
const subCategory = require("../models/subCategory");
const SubCategories = require("../models/subCategory");

exports.createSubCategory = async (req, res) => {
  try {
    const {
      name,
      image,
      icon,
      slug,
      categoryId,
      available,
      isTrending,
      sortOrder,
    } = req.body;

    // Convert name to lowercase for case-insensitive comparison
    const nameLower = name.trim().toLowerCase();

    // Check if a category with the same name exists (case-insensitive)
    const existingCategory = await SubCategories.findOne({
      name: new RegExp(`^${nameLower}$`, "i"),
    });

    if (existingCategory) {
      return res
        .status(200)
        .json({
          responseCode: 400,
          message: "Category already exists with the same name",
        });
    }

    // Create a new category item
    const newCategory = new SubCategories({
      name: nameLower,
      image: image || "",
      icon: icon || "",
      slug: slug,
      categoryId: categoryId,
      available: available !== undefined ? available : true, // ✅ default true
      isTrending: isTrending || false,
      sortOrder: sortOrder || 0,
    });

    // Save the new category to the database
    const savedCategory = await newCategory.save();

    return res
      .status(201)
      .json({
        responseCode: 200,
        message: "SubCategory created successfully",
        subCategory: savedCategory,
      });
  } catch (error) {
    console.error("Error creating category item:", error);
    return res
      .status(500)
      .json({
        responseCode: 500,
        message: "Failed to create SubCategory item",
        error: error.message,
      });
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const {
      _id,
      name,
      image,
      icon,
      slug,
      available,
      categoryId,
      isTrending,
      sortOrder,
    } = req.body;

    const updatedCategory = await subCategory.findByIdAndUpdate(
      _id,
      { name, image, icon, available, slug, categoryId, isTrending, sortOrder },
      { new: true },
    );

    if (!updatedCategory) {
      return res
        .status(200)
        .json({ responseCode: 404, message: "SubCategory not found" });
    }

    res
      .status(200)
      .json({
        responseCode: 200,
        message: "SubCategory updated successfully",
        updatedCategory,
      });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
};

// Delete Category Item
exports.deleteSubCategory = async (req, res) => {
  try {
    const { _id } = req.body;

    const deletedCategory = await SubCategories.findByIdAndDelete(_id);

    if (!deletedCategory) {
      return res
        .status(200)
        .json({ responseCode: 404, message: "SubCategory not found" });
    }

    res
      .status(200)
      .json({ responseCode: 200, message: "SubCategory deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};

exports.getSubCategories = async (req, res) => {
  try {
    const categoriesItems = await SubCategories.find();
    res.status(200).json({ SubCategories: categoriesItems });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
};

exports.getSubCategory = async (req, res) => {
  const { categoryId } = req.body;

  try {
    let query = {};

    if (categoryId && categoryId.trim() !== "") {
      query.categoryId = categoryId;
    }

    const categoriesItems = await subCategory.find(query);

    res.status(200).json({
      subCategory: categoriesItems,
      message: "SubCategory Items Retrieved Successfully",
    });
  } catch (error) {
    console.error("Error fetching subcategory items:", error);
    res.status(500).json({ error: "Failed to fetch subcategory items" });
  }
};
