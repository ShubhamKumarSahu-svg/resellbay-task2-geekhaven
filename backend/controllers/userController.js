const User = require('../models/User');
const Review = require('../models/Review');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/auth');

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, profileImage } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (address) updates.address = address;
  if (profileImage) updates.profileImage = profileImage;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select('-password -verificationToken');

  res.status(200).json({ message: 'Profile updated successfully.', user });
});

exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('name profileImage rating memberSince')
    .lean();

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const reviews = await Review.find({
    subject: req.params.id,
    reviewType: 'User',
  })
    .populate('reviewer', 'name profileImage')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  res.status(200).json({ user, reviews });
});

exports.becomeSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.role === 'seller') {
    throw new AppError('You are already a seller.', 400);
  }

  user.role = 'seller';
  await user.save();

  const updatedUser = await User.findById(req.user._id).select('-password');

  res.status(200).json({
    message: 'Congratulations! You are now registered as a seller.',
    user: updatedUser,
  });
});

exports.getAllSellers = asyncHandler(async (req, res) => {
  const sellers = await User.find({ role: 'seller', isVerified: true })
    .select('name profileImage rating address.city address.state')
    .lean();

  res.status(200).json({ sellers });
});
