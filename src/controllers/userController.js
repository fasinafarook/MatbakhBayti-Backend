// const User = require('../models/userModel');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ msg: 'User already exists' });

//     // hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // save user
//     const newUser = new User({ name, email, password: hashedPassword });
//     await newUser.save();

//     res.status(201).json({ msg: 'User registered successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // check user
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

//     // check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

//     // sign token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
//     res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendOTPEmail = require('../services/mailer');
const { generateOTP } = require('../services/otpService');

const otpMap = new Map();

const CustomError = require('../services/customError');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      throw new CustomError(400, 'Name, email, and password are required.');
    }

    const existing = await User.findOne({ email });
    if (existing) {
      throw new CustomError(409, 'User already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    if (!otp) {
      throw new CustomError(500, 'Failed to generate OTP.');
    }

    otpMap.set(email, {
      otp,
      userData: { name, email, password: hashedPassword },
      expires: Date.now() + 10 * 60 * 1000
    });

    try {
      await sendOTPEmail(email, otp, name);
    } catch (err) {
      otpMap.delete(email);
      throw new CustomError(500, 'Failed to send OTP email.');
    }

    res.status(200).json({ msg: 'OTP sent successfully.' });
  } catch (err) {
    next(err); 
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError(400, 'Invalid credentials');
    }

    if (!user.isVerified) {
      throw new CustomError(400, 'Please verify your email first.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new CustomError(400, 'Invalid credentials');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Set cookie with development-safe options
    res.cookie('userToken', token, {
      httpOnly: true,
      secure: false, // ❌ Don't use 'true' in dev (needs HTTPS)
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const record = otpMap.get(email);

    if (!record) {
      throw new CustomError(400, 'OTP not sent');
    }

    if (Date.now() > record.expires) {
      throw new CustomError(400, 'OTP expired');
    }

    if (record.otp !== otp) {
      throw new CustomError(400, 'Invalid OTP');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError(400, 'User already exists');
    }

    const newUser = new User({
      ...record.userData,
      isVerified: true,
    });

    await newUser.save();
    otpMap.delete(email);

    res.json({ msg: 'Email verified and user registered successfully.' });
  } catch (err) {
    next(err);
  }
};