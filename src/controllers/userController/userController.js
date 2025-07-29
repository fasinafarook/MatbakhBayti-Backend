const User = require("../../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOTPEmail = require("../../services/mailer");
const { generateOTP } = require("../../services/otpService");
const CustomError = require("../../services/customError");

const otpMap = new Map();

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new CustomError(400, "Name, email, and password are required.");
    }
    if (!/^[A-Za-z\s]+$/.test(name)) {
      throw new CustomError(400, "Name must contain only letters");
    }
    if (!password || password.length < 6) {
      throw new CustomError(400, "Password must be at least 6 characters long");
    }
    const existing = await User.findOne({ email });
    if (existing) {
      throw new CustomError(409, "User already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    if (!otp) {
      throw new CustomError(500, "Failed to generate OTP.");
    }

    otpMap.set(email, {
      otp,
      userData: { name, email, password: hashedPassword },
      expires: Date.now() + 10 * 60 * 1000,
    });

    try {
      await sendOTPEmail(email, otp, name);
    } catch (err) {
      otpMap.delete(email);
      throw new CustomError(500, "Failed to send OTP email.");
    }

    res.status(200).json({ msg: "OTP sent successfully." });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new CustomError(400, "Valid email is required");
    }

    // Password validation
    if (!password || password.length < 6) {
      throw new CustomError(400, "Password must be at least 6 characters long");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError(400, "Invalid credentials");
    }

    if (user.isBlocked) {
      throw new CustomError(400, "Please verify your email first.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new CustomError(400, "Invalid credentials");
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET,
      {
        expiresIn: "30d",
      }
    );

    res.cookie("userToken", accessToken, {
      httpOnly: true,
      secure: false, // true only in production with HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
        token: accessToken,
    });
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const record = otpMap.get(email);

    if ( !otp) {
      throw new CustomError(400, "OTP  required.");
    }
    if (!record) {
      throw new CustomError(400, "OTP not sent");
    }

    if (Date.now() > record.expires) {
      throw new CustomError(400, "OTP expired");
    }

    if (record.otp !== otp) {
      throw new CustomError(400, "Invalid OTP");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError(400, "User already exists");
    }

    const newUser = new User({
      ...record.userData,
      isBlocked: false,
    });

    await newUser.save();
    otpMap.delete(email);

    res.json({ msg: "Email verified and user registered successfully." });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("userToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("userToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new CustomError(400, "Email is required.");
    }

    const record = otpMap.get(email);

    if (!record) {
      throw new CustomError(
        400,
        "No OTP request found. Please register first."
      );
    }

    const { userData } = record;

    const newOtp = generateOTP();

    if (!newOtp) {
      throw new CustomError(500, "Failed to generate new OTP.");
    }

    otpMap.set(email, {
      otp: newOtp,
      userData,
      expires: Date.now() + 10 * 60 * 1000,
    });

    await sendOTPEmail(email, newOtp, userData.name);

    res.status(200).json({ msg: "OTP resent successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyOtp,
  refreshToken,
  logout,
  resendOtp,
};
