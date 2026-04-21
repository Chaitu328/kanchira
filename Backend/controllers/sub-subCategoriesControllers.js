const SubCategories = require('../models/subCategory');
const SubSubCategories = require('../models/sub-subcategories');
exports.createSub_SubCategory = async (req, res) => {
  try {
    const { name, image, slug, subCategoryId, categoryId } = req.body;

    // Convert name to lowercase for case-insensitive comparison
    const nameLower = name.trim().toLowerCase();
    const updatedCategory = await SubCategories.findOne(
      { _id: subCategoryId },
    );

    if (!updatedCategory) {
      return res.status(200).json({ responseCode: 404, message: "SubCategory not found" });
    }

    // Check if a category with the same name exists (case-insensitive)
    const existingCategory = await SubSubCategories.findOne({ name: new RegExp(`^${nameLower}$`, "i") });

    if (existingCategory) {
      return res.status(200).json({ responseCode: 400, message: "Sub-SubCategory already exists with the same name" });
    }

    // Create a new category item
    const newCategory = new SubSubCategories({
      name: nameLower, // Store name in lowercase
      image: image || "", // Default to empty string if not provided
      slug: slug,
      subCategoryId: subCategoryId,
      categoryId: categoryId
    });

    // Save the new category to the database
    const savedCategory = await newCategory.save();

    return res.status(201).json({ responseCode: 200, message: "Sub-SubCategory created successfully", subCategory: savedCategory });

  } catch (error) {
    console.error("Error creating Sub-Subcategory item:", error);
    return res.status(500).json({ responseCode: 500, message: "Failed to create  Sub-SubCategory item", error: error.message });
  }
};

exports.updateSub_SubCategory = async (req, res) => {
  try {
    const { _id, name, image, slug, available, subCategoryId } = req.body;

    const updatedCategory = await SubSubCategories.findByIdAndUpdate(
      _id,
      { name, image, available, slug, subCategoryId },
      { new: true } // Returns the updated document
    );

    if (!updatedCategory) {
      return res.status(200).json({ responseCode: 404, message: "SubCategory not found" });
    }

    res.status(200).json({ responseCode: 200, message: "Sub-SubCategory updated successfully", updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Delete Category Item
exports.deleteSub_SubCategory = async (req, res) => {
  try {
    const { _id } = req.body;

    const deletedCategory = await SubSubCategories.findByIdAndDelete(_id);

    if (!deletedCategory) {
      return res.status(200).json({ responseCode: 404, message: "SubCategory not found" });
    }

    res.status(200).json({ responseCode: 200, message: "Sub-SubCategory deleted successfully" });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

exports.getSub_SubCategories = async (req, res) => {
  try {
    // Fetch all menu items from the database
    const categoriesItems = await SubSubCategories.find();

    // Respond with the menu items
    res.status(200).json({ subSubCategories: categoriesItems });
  } catch (error) {
    console.error('Error fetching menu items:', error);

    // Respond with a 500 error in case of failure
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};
exports.getSub_SubCategory = async (req, res) => {
  const { subCategoryId } = req.body;
  try {
    // Fetch all menu items from the database
    const categoriesItems = await SubSubCategories.find({ subCategoryId });
    // Respond with the menu items
    res.status(200).json({ sub_SubCategories: categoriesItems, message: "Sub-SubCategory Item Retrived Succesfully" });
  } catch (error) {
    console.error('Error fetching menu items:', error);

    // Respond with a 500 error in case of failure
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

// controllers/subCategoryController.js

exports.getSubSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;

    const subcategories = await SubSubCategories.find({ categoryId });

    const formatted = subcategories.map((sub) => ({
      title: sub.name,
      _id: sub._id,
      image: sub.image,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Error fetching subcategories:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


