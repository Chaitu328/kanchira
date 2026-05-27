const Categories = require('../models/categories');
const subSubcategories = require('../models/sub-subcategories');
const subCategory = require('../models/subCategory');
exports.createCategory= async (req, res) => {
  try {
    const { name, image,description,slug } = req.body;

    // Convert name to lowercase for case-insensitive comparison
    const nameLower = name.trim().toLowerCase();

    // Check if a category with the same name exists (case-insensitive)
    const existingCategory = await Categories.findOne({ name: new RegExp(`^${nameLower}$`, "i") });

    if (existingCategory) {
      return res.status(200).json({ responseCode: 400, message: "Category already exists with the same name" });
    }

    // Create a new category item
    const newCategory = new Categories({
      name: nameLower, // Store name in lowercase
      image: image || "", // Default to empty string if not provided
      description:description,
      slug:slug
    });

    // Save the new category to the database
    const savedCategory = await newCategory.save();

    return res.status(201).json({ responseCode: 200, message: "Category created successfully", category: savedCategory });

  } catch (error) {
    console.error("Error creating category item:", error);
    return res.status(500).json({ responseCode: 500, message: "Failed to create category item", error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { _id,name,  image, description,available ,slug} = req.body;

    const updatedCategory = await Categories.findByIdAndUpdate(
      _id,
      { name, image,available,description,slug},
      { new: true } // Returns the updated document
    );

    if (!updatedCategory) {
      return res.status(200).json({ responseCode: 404, message: "Category not found" });
    }

    res.status(200).json({ responseCode: 200, message: "Category updated successfully", updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Delete Category Item
exports.deleteCategory = async (req, res) => {
  try {
    const _id = req.params.id || req.body._id;

    const deletedCategory = await Categories.findByIdAndDelete(_id);

    if (!deletedCategory) {
      return res.status(200).json({ responseCode: 404, message: "Category not found" });
    }

    res.status(200).json({ responseCode: 200, message: "Category deleted successfully" });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    // Fetch all menu items from the database
    const categoriesItems = await Categories.find();

    // Respond with the menu items
    res.status(200).json(categoriesItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);

    // Respond with a 500 error in case of failure
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};
exports.getCategory = async (req, res) => {
  const {categoryId}=req.params;
  try {
    // Fetch all menu items from the database
    const categoriesItems = await Categories.findOne({_id:categoryId});

    // Respond with the menu items
    res.status(200).json({category:categoriesItems, message:"Category Item Retrived Succesfully"});
  } catch (error) {
    console.error('Error fetching menu items:', error);

    // Respond with a 500 error in case of failure
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};


exports.getCategoriesWithSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.body;

    let categories = [];

    if (categoryId) {
      // Find only one category if categoryId is provided
      const category = await Categories.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      categories = [category];
    } else {
      // Otherwise return all categories
      categories = await Categories.find();
    }

    const result = await Promise.all(categories.map(async (cat) => {
      const subcategories = await subCategory.find({ categoryId: cat._id });

      return {
        id: cat._id,
        title: cat.name,
        image: cat.image,
        subcategories: subcategories.map(sub => ({
          title: sub.name,
          image: sub.image,
          id:sub._id
        })),
      };
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getCategoriesWithSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.body;

    let categories = [];

    if (categoryId) {
      const category = await Categories.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      categories = [category];
    } else {
      categories = await Categories.find();
    }

    const result = await Promise.all(categories.map(async (cat) => {
      const subcategories = await subCategory.find({ categoryId: cat._id });

      const subcategoriesWithSubSubs = await Promise.all(subcategories.map(async (sub) => {
        const subSubCategories = await subSubcategories.find({ subCategoryId: sub._id });

        return {
          id: sub._id,
          title: sub.name,
          image: sub.image,
          subSubCategories: subSubCategories.map(subSub => ({
            id: subSub._id,
            title: subSub.name,
            image: subSub.image,
            isNewArrival: subSub.isNewArrival,
          }))
        };
      }));

      return {
        id: cat._id,
        title: cat.name,
        image: cat.image,
        subcategories: subcategoriesWithSubSubs
      };
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Server error' });
  }
};