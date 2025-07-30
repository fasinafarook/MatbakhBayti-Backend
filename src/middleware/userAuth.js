const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.userToken;

    if (!token) {
      return next({
        status: 401,
        message: "Unauthorized - No access token",
        code: "NO_ACCESS_TOKEN",
      });
    }

    let decoded;

    try {
      // Try verifying access token
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
          return next({
            status: 401,
            message: "Session expired. Please log in again.",
            code: "NO_REFRESH_TOKEN",
          });
        }

        try {
          const refreshDecoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

          // Create new access token
          const newAccessToken = jwt.sign(
            { id: refreshDecoded.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          );

          // Set the new access token
          res.cookie("userToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          decoded = refreshDecoded;
        } catch (refreshErr) {
          return next({
            status: 401,
            message: "Invalid or expired refresh token. Please log in again.",
            code: "INVALID_REFRESH_TOKEN",
          });
        }
      } else {
        return next({
          status: 401,
          message: "Invalid access token",
          code: "INVALID_ACCESS_TOKEN",
        });
      }
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next({
        status: 401,
        message: "Unauthorized - User not found",
        code: "USER_NOT_FOUND",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return next({
      status: 500,
      message: "Authentication middleware error",
      code: "AUTH_MIDDLEWARE_ERROR",
      detail: error.message,
    });
  }
};


module.exports = userAuth;
