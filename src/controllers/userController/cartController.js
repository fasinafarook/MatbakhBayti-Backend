const Cart = require('../../models/cartModel');
const Product = require('../../models/productModel');
const CustomError = require('../../services/customError'); 

// Get user's cart
const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        items: cart.items,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Add item to cart
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isListed) {
      throw new CustomError(404, "Product not found or not available");
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [{ product: productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json({ success: true, message: 'Product added to cart', data: cart });
  } catch (err) {
    next(err);
  }
};

// Update item quantity
const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      throw new CustomError(400, "Quantity must be at least 1");
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) throw new CustomError(404, "Cart not found");

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) throw new CustomError(404, "Item not found in cart");

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    const populatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    res.status(200).json({ success: true, message: "Cart updated", data: populatedCart  });
  } catch (err) {
    next(err);
  }
};

// Remove item from cart
const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.body;
    // console.log('pID',productId);

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) throw new CustomError(404, "Cart not found");

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    const populatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    res.status(200).json({ success: true, message: "Item removed from cart", data: populatedCart });
  } catch (err) {
    next(err);
  }
};

// Clear entire cart
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) throw new CustomError(404, "Cart not found");

    cart.items = [];
    await cart.save();

    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
