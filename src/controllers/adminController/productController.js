const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');

const addProduct = async (req, res) => {
  try {
    const { name, price, description, category,preparationTime ,type } = req.body;

    if (!name || !price || !description || !category ||!preparationTime || !type ) {
  return res.status(400).json({
    success: false,
    errors: {
      name: !name ? "Name is required" : undefined,
      price: !price ? "Price is required" : undefined,
      description: !description ? "Description is required" : undefined,
      category: !category ? "Category is required" : undefined,
      preparationTime: !preparationTime ? "preparationTime is required" : undefined,
      type: !type ? "Type (Veg or Non-Veg) is required" : undefined,
    },
  });
}

if (isNaN(price) || price <= 0) {
  return res.status(400).json({
    success: false,
    errors: { price: "Price must be a positive number" },
  });
}

if (!req.file) {
  return res.status(400).json({
    success: false,
    errors: { image: "Product image is required" },
  });
}

  if (!['Veg', 'Non-Veg'].includes(type)) {
      return res.status(400).json({
        success: false,
        errors: { type: "Type must be either 'Veg' or 'Non-Veg'" },
      });
    }

    const imageUrl = req.file?.path || '';

    const newProduct = await Product.create({
      name,
      price,
      description,
      category,
      preparationTime,
      image: imageUrl,
      type,
    });

    res.status(201).json({ success: true, product: newProduct });

  } catch (error) {
    error.statusCode = 500;
    error.message = 'Failed to add product';
    next(error);
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
    const updatedData = { ...req.body };

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // If name is being updated, ensure uniqueness
    if (updatedData.name) {
      const existingProduct = await Product.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${updatedData.name}$`, 'i') },
      });

      if (existingProduct) {
        return res.status(409).json({ message: "Product name already exists" });
      }
    }

    // If category is being updated, validate it
    if (updatedData.category) {
      const validCategory = await Category.findById(updatedData.category);
      if (!validCategory) {
        return res.status(400).json({ success: false, message: "Invalid category ID" });
      }
    }

    // If new image uploaded
    if (req.file) {
      updatedData.image = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({ success: true, product: updatedProduct });

  } catch (error) {
    console.error("Update Product Error:", error);
    next({ statusCode: 500, message: "Failed to update product" });
  }
};

// Toggle isListed
const toggleProductListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('log',id);
    

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
