const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewType: {
      type: String,
      required: true,
      enum: ['User', 'Product'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'reviewType',
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: String,
  },
  { timestamps: true }
);

// Prevent duplicate reviews
reviewSchema.index({ order: 1, reviewer: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
