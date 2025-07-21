const express = require('express');
const { register, login, verifyOtp, refreshToken } = require('../../controllers/userController/userController');

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.get('/refresh-token', refreshToken);
router.post('/verify-otp', verifyOtp);

module.exports = router;