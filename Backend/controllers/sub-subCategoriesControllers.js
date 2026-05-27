const SubCategories = require('../models/subCategory');
const SubSubCategories = require('../models/sub-subcategories');

exports.createSub_SubCategory = async (req, res) => {
  try {
    const { name, image, slug, subCategoryId, categoryId } = req.body;

    const nameLower = name.trim().toLowerCase();
    const updatedCategory = await SubCategories.findOne({ _id: subCategoryId });

    if (!updatedCategory) {
      return res.status(200).json({ responseCode: 404, message: "SubCategory not found" });
    }

    const existingCategory = await SubSubCategories.findOne({ name: new RegExp(`^${nameLower}$`, "i") });
    if (existingCategory) {
      return res.status(200).json({ responseCode: 400, message: "Sub-SubCategory already exists with the same name" });
    }

    const newCategory = new SubSubCategories({
      name: nameLower,
      image: image || "",
      slug: slug,
      subCategoryId: subCategoryId,
      categoryId: categoryId,
    });

    const savedCategory = await newCategory.save();
    return res.status(201).json({ responseCode: 200, message: "Sub-SubCategory created successfully", subCategory: savedCategory });
  } catch (error) {
    console.error("Error creating Sub-Subcategory item:", error);
    return res.status(500).json({ responseCode: 500, message: "Failed to create Sub-SubCategory item", error: error.message });
  }
};

exports.updateSub_SubCategory = async (req, res) => {
  try {
    const { _id, name, image, slug, available, subCategoryId } = req.body;

    const updatedCategory = await SubSubCategories.findByIdAndUpdate(
      _id,
      { name, image, available, slug, subCategoryId },
      { new: true }
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

exports.deleteSub_SubCategory = async (req, res) => {
  try {
    // FIX: DELETE /sub-subcategory/delete/:id — read id from req.params, not req.body
    // The route is router.delete("/sub-subcategory/delete/:id", ...) so the id
    // is in the URL, but the old code read req.body._id which is always undefined
    // for a DELETE request from the frontend (which passes id in the URL only).
    const _id = req.params.id || req.body._id;

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

// GET /sub-subcategory/all → returns { subSubCategories: [...] }
exports.getSub_SubCategories = async (req, res) => {
  try {
    const categoriesItems = await SubSubCategories.find();
    res.status(200).json({ subSubCategories: categoriesItems });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

// GET /sub-subcategory/:id
// FIX: Old code read subCategoryId from req.body — impossible on a GET request.
// This route is matched by id in req.params. Since the frontend passes a
// subCategoryId to filter by, we support both: filter by subCategoryId query
// param OR return the single document by _id.
exports.getSub_SubCategory = async (req, res) => {
  try {
    // Support ?subCategoryId=xxx as a query param (used by frontend dropdowns)
    const subCategoryId = req.query.subCategoryId;
    if (subCategoryId) {
      const categoriesItems = await SubSubCategories.find({ subCategoryId });
      return res.status(200).json({ sub_SubCategories: categoriesItems, message: "Sub-SubCategory Items Retrieved Successfully" });
    }
    // Otherwise treat :id as the document _id
    const item = await SubSubCategories.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ responseCode: 404, message: "Sub-SubCategory not found" });
    }
    res.status(200).json({ sub_SubCategory: item });
  } catch (error) {
    console.error('Error fetching sub-subcategory:', error);
    res.status(500).json({ error: 'Failed to fetch sub-subcategory' });
  }
};

// GET /sub-subcategory/by-category/:categoryId
// FIX: Old code read categoryId from req.body — impossible on a GET request.
// It must come from req.params since the route is /by-category/:categoryId.
exports.getSubSubcategoriesByCategory = async (req, res) => {
  try {
    // ✅ FIX: route is GET /sub-subcategory/by-category/:categoryId
    // so read from req.params, not req.body (GET has no body)
    // Also query by subCategoryId — that's what the frontend passes
    const subCategoryId = req.params.categoryId;

    const subcategories = await SubSubCategories.find({ subCategoryId });

    res.status(200).json({ sub_SubCategories: subcategories });
  } catch (err) {
    console.error('Error fetching subcategories:', err);
    res.status(500).json({ message: 'Server error' });
  }
};