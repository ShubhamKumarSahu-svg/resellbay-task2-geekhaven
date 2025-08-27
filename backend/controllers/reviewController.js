const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../middleware/auth');
const {
  updateUserRating,
  updateProductRating,
} = require('../utils/ratingUtils');
exports.createSellerReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { orderId } = req.params;
  const reviewerId = req.user._id;

  const order = await Order.findById(orderId).populate('items.seller');
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.buyer.toString() !== reviewerId.toString()) {
    throw new AppError('You are not authorized to review this order', 403);
  }

  const sellerId = order.items[0]?.seller._id;
  if (!sellerId) {
    throw new AppError('Could not determine the seller for this order.', 400);
  }

  // Prevent self-review
  if (sellerId.toString() === reviewerId.toString()) {
    throw new AppError('You cannot review yourself.', 400);
  }

  const existingReview = await Review.findOne({
    order: orderId,
    reviewer: reviewerId,
    reviewType: 'User',
    subject: sellerId,
  });

  if (existingReview) {
    throw new AppError(
      'You have already reviewed the seller for this order.',
      400
    );
  }

  const review = await Review.create({
    reviewType: 'User',
    subject: sellerId,
    reviewer: reviewerId,
    order: orderId,
    rating,
    comment,
  });

  await updateUserRating(sellerId);

  res.status(201).json({
    success: true,
    message: 'Seller review submitted successfully.',
    review,
  });
});

exports.createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, productId } = req.body;
  const { orderId } = req.params;
  const reviewerId = req.user._id;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.buyer.toString() !== reviewerId.toString()) {
    throw new AppError('You are not authorized to review this order', 403);
  }

  const productInOrder = order.items.some(
    (item) => item.product.toString() === productId
  );

  if (!productInOrder) {
    throw new AppError(
      'This product was not part of the specified order.',
      400
    );
  }

  // Get product to check ownership
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Prevent self-review
  if (product.seller.toString() === reviewerId.toString()) {
    throw new AppError('You cannot review your own product.', 400);
  }

  const existingReview = await Review.findOne({
    order: orderId,
    reviewer: reviewerId,
    subject: productId,
  });

  if (existingReview) {
    throw new AppError(
      'You have already reviewed this product for this order.',
      400
    );
  }

  const review = await Review.create({
    reviewType: 'Product',
    subject: productId,
    reviewer: reviewerId,
    order: orderId,
    rating,
    comment,
  });

  await updateProductRating(productId);

  await Order.updateOne(
    { _id: orderId, 'items.product': productId },
    { $set: { 'items.$.isReviewed': true } }
  );

  res.status(201).json({
    success: true,
    message: 'Product review submitted successfully.',
    review,
  });
});

exports.getReviewsForUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const reviews = await Review.find({
    subject: userId,
    reviewType: 'User',
  })
    .populate('reviewer', 'name profileImage')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    reviews,
  });
});

exports.getReviewsForProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const reviews = await Review.find({
    subject: productId,
    reviewType: 'Product',
  })
    .populate('reviewer', 'name profileImage')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    reviews,
  });
});
