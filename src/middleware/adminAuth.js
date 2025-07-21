const jwt = require('jsonwebtoken');

const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET;

const adminAuth = (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin token missing',
        code: 'ADMIN_AUTH_REQUIRED',
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_ADMIN_SECRET);

    // Optional: Add decoded info to request
    req.admin = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired admin token',
      code: 'ADMIN_TOKEN_INVALID',
      detail: error.message,
    });
  }
};

module.exports = adminAuth;
