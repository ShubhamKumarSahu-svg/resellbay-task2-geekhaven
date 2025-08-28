const Review = require('../models/Review');
const User = require('../models/User');
const Product = require('../models/Product');

const updateUserRating = async (userId) => {
  const stats = await Review.aggregate([
    { $match: { subject: userId, reviewType: 'User' } },
    {
      $group: {
        _id: '$subject',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(userId, {
      'rating.average': Math.round(stats[0].average * 10) / 10,
      'rating.count': stats[0].count,
    });
  } else {
    await User.findByIdAndUpdate(userId, {
      'rating.average': 0,
      'rating.count': 0,
    });
  }
};

const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { subject: productId, reviewType: 'Product' } },
    {
      $group: {
        _id: '$subject',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'rating.average': Math.round(stats[0].average * 10) / 10,
      'rating.count': stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      'rating.average': 0,
      'rating.count': 0,
    });
  }
};

module.exports = { updateUserRating, updateProductRating };
