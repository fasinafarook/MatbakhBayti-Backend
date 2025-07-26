const Product = require('../../models/productModel');
const Category = require("../../models/categoryModel");

const getAllListedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isListed: true }).populate('category', 'name'); 
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    error.statusCode = 500;
    error.message = 'Failed to fetch Products';
    next(error);
  }
};

const getListedCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isListed: true }).sort("name");
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  getAllListedProducts,
  getListedCategories
};
