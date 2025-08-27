const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/auth');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');
const JWT_EXPIRES_IN = '7d';
const JWT_SECRET = process.env.JWT_SECRET;

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

exports.register = asyncHandler(async (req, res) => {
  const { email, password, name, confirmPassword, phone } = req.body;

  if (!email || !password || !name || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, password, and confirm password are required',
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match',
    });
  }

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return res
      .status(409)
      .json({ success: false, message: 'Email already registered' });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    email,
    password: hashed,
    name,
    phone,
    verificationToken,
    verificationTokenExpires,
    isVerified: false,
  });

  try {
    await sendVerificationEmail(user, verificationToken);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
  }

  const payload = {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  };
  const accessToken = signToken(payload);
  const refreshToken = signToken(payload);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      accountStatus: user.accountStatus,
    },
    message:
      'Registration successful. Please check your email for verification.',
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Email and password are required' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid credentials' });
  }

  if (user.accountStatus !== 'active') {
    return res.status(403).json({
      success: false,
      message: `Your account is ${user.accountStatus}`,
    });
  }

  const payload = {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  };
  const accessToken = signToken(payload);
  const refreshToken = signToken(payload);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      accountStatus: user.accountStatus,
    },
    message: 'Login successful',
  });
});

exports.refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Refresh token missing' });
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid or expired refresh token' });
  }

  const user = await User.findById(payload.id)
    .select('_id email role accountStatus isVerified')
    .lean();
  if (!user || user.accountStatus !== 'active') {
    return res
      .status(401)
      .json({ success: false, message: 'User not found or inactive' });
  }

  const newAccessToken = signToken({
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  res.json({ success: true, accessToken: newAccessToken, user });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -verificationToken')
    .lean();

  if (!user)
    return res.status(404).json({ success: false, message: 'User not found' });

  res.json({ success: true, user });
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Verification token is required',
    });
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token',
    });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully! You can now log in.',
  });
});

exports.resendVerification = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  if (user.isVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified',
    });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  user.verificationToken = verificationToken;
  user.verificationTokenExpires = verificationTokenExpires;
  await user.save();

  try {
    await sendVerificationEmail(user, verificationToken);
    res.json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.',
    });
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email. Please try again later.',
    });
  }
});

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.json({ success: true, message: 'Logged out successfully' });
});
