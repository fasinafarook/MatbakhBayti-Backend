const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');

const addProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const imageUrl = req.file?.path || ''; // Cloudinary URL

    const newProduct = await Product.create({
      name,
      price,
      description,
      category,
      image: imageUrl,
    });

    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding product' });
  }
};


// List all products
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('category');
    res.status(200).json(products);
  } catch (error) {
    error.statusCode = 500;
    error.message = 'Failed to fetch products';
    next(error);
  }
};

// Edit a product
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedProduct) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    error.statusCode = 500;
    error.message = 'Failed to update product';
    next(error);
  }
};

// Toggle isListed
const toggleProductListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      return next(error);
    }

    product.isListed = !product.isListed;
    await product.save();

    res.status(200).json({ message: 'Product listing updated', isListed: product.isListed });
  } catch (error) {
    error.statusCode = 500;
    error.message = 'Failed to update listing status';
    next(error);
  }
};


module.exports = {
  addProduct,
  getAllProducts,
  updateProduct,
  toggleProductListing 
};
