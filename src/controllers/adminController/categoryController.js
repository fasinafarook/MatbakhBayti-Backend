const Category = require('../../models/categoryModel');


const addCategory = async (req, res) => {
  try {
    const { name, isListed } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        errors: { name: "Category name is required" },
      });
    }

      const existingCategory = await Category.findOne({ name: name.trim() });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        errors: { name: "Category already exists" }, 
      });
    }

    const category = new Category({
      name: name.trim(),
      isListed: isListed !== undefined ? isListed : true,
    });

    await category.save();

    return res.status(201).json({
      success: true,
      message: "Category added successfully",
      category,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      detail: err.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, categories });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      detail: err.message,
    });
  }
};

const editCategory = async (req, res) => {
  try {
    const { name, isListed } = req.body;
    const categoryId = req.params.id;

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        ...(name && { name }),
        ...(typeof isListed === 'boolean' && { isListed }),
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      detail: err.message,
    });
  }
};

const toggleCategoryListStatus = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category.isListed = !category.isListed;
    await category.save();

    res.status(200).json({
      success: true,
      message: `Category ${category.isListed ? 'listed' : 'unlisted'} successfully`,
      category,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle category status',
      detail: err.message,
    });
  }
};
module.exports = {
  addCategory,
  getAllCategories,
  editCategory,
  toggleCategoryListStatus
};
