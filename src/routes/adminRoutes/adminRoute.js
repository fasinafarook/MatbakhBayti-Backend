const express = require('express');
const { cloudinaryUpload } = require('../../services/cloudinary');

const { adminLogin, adminLogout} = require('../../controllers/adminController/adminController');
const {
    addCategory,
    getAllCategories,
    editCategory,
    toggleCategoryListStatus
} = require('../../controllers/adminController/categoryController')

const {
    addProduct,
    getAllProducts,
    updateProduct,
    toggleProductListing
} = require('../../controllers/adminController/productController');

const { getAllUsers,toggleBlockUser} = require('../../controllers/adminController/userController');
const { getAllOrders,updateOrderStatus} = require('../../controllers/adminController/orderController');


const adminAuth = require('../../middleware/adminAuth');

const router = express.Router();

router.post('/login', adminLogin);
router.post('/logout', adminLogout);

router.post('/category', adminAuth,addCategory);
router.get('/categories', adminAuth,getAllCategories);
router.put('/category/:id',adminAuth, editCategory);
router.patch('/category/:id/toggle-list',adminAuth, toggleCategoryListStatus);

router.post('/product', cloudinaryUpload.single('image'),adminAuth, addProduct);
router.get('/products', adminAuth,getAllProducts);
router.put('/product/:id', adminAuth,updateProduct);
router.patch('/product/:id/toggle-list', adminAuth,toggleProductListing);

router.get('/users', adminAuth,getAllUsers);
router.patch('/user/:id/toggle-block', adminAuth,toggleBlockUser);

router.get('/order', adminAuth, getAllOrders);
router.patch('/order/:id/status', adminAuth, updateOrderStatus);


module.exports = router;
