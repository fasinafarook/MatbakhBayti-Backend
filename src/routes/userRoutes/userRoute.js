const express = require('express');
const { register, login, verifyOtp, refreshToken,logout,resendOtp } = require('../../controllers/userController/userController');
const {getAllListedProducts,getListedCategories} = require('../../controllers/userController/productController');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../../controllers/userController/cartController');
const userAuth = require('../../middleware/userAuth');
const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.get('/refresh-token', refreshToken);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post("/logout",userAuth, logout);

router.get('/products',getAllListedProducts);
router.get('/category',getListedCategories);

router.get('/cart', userAuth, getCart);
router.post('/add-cart', userAuth, addToCart);
router.put('/update-cart', userAuth, updateCartItem);
router.delete('/remove-cart', userAuth, removeCartItem);
router.delete('/clear-cart', userAuth, clearCart);


module.exports = router;