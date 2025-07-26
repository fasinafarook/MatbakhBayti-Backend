const express = require('express');
const { register, login, verifyOtp, refreshToken,logout,resendOtp } = require('../../controllers/userController/userController');
const {getAllListedProducts,getListedCategories} = require('../../controllers/userController/productController');
const userAuth = require('../../middleware/userAuth');
const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.get('/refresh-token', refreshToken);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post("/logout",userAuth, logout);

router.get('/products', userAuth,getAllListedProducts);
router.get('/category', userAuth,getListedCategories);


module.exports = router;