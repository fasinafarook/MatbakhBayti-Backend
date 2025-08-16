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
const { placeOrder,getSavedAddresses,updateAddress,getMyOrders,cancelOrder,getOrderDetails,cancelOrderItem } = require ('../../controllers/userController/orderController');
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

router.post("/order", userAuth, placeOrder);
router.put("/update-address/:orderId", userAuth, updateAddress);
router.get('/addresses', userAuth, getSavedAddresses);
router.get("/orders/my-orders", userAuth, getMyOrders);
router.patch("/orders/:orderId/cancel", userAuth, cancelOrder);
router.get("/orders/:orderId", userAuth, getOrderDetails);
router.patch("/orders/:orderId/items/:itemId/cancel",userAuth,cancelOrderItem);


module.exports = router;