const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.userToken;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - No token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = userAuth;
