const jwt = require("jsonwebtoken");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET;

// Admin Login
const adminLogin = (req, res, next) => {
  const { email, password } = req.body;

  // Invalid credentials
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return next({
      statusCode: 401,
      message: "Invalid admin credentials",
      code: "INVALID_ADMIN_CREDENTIALS",
    });
  }

  try {
    const token = jwt.sign({ role: "admin" }, JWT_ADMIN_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: true, // Set to true in production
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Admin login successful",
      token, 
    });
  } catch (error) {
    return next({
      statusCode: 500,
      message: "Token generation failed",
      code: "TOKEN_ERROR",
      detail: error.message,
    });
  }
};

const adminLogout = (req, res, next) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    return res.status(200).json({ message: "Admin logged out successfully" });
  } catch (error) {
    next({
      statusCode: 500,
      message: "Logout failed",
      code: "LOGOUT_ERROR",
      detail: error.message,
    });
  }
};

module.exports = {
  adminLogin,
  adminLogout,
};
