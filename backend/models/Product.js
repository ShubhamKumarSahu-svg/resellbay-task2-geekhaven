const mongoose = require('mongoose');
const crypto = require('crypto');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
      validate: {
        validator: function (value) {
          return !value || value >= this.price;
        },
        message:
          'Original price must be greater than or equal to current price',
      },
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'],
        message: '{VALUE} is not a valid category',
      },
    },
    condition: {
      type: String,
      required: [true, 'Product condition is required'],
      enum: {
        values: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
        message: '{VALUE} is not a valid condition',
      },
    },
    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'Cannot have more than 10 images',
      },
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },

    // --- NEWLY ADDED RATING OBJECT ---
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    // ------------------------------------

    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    stock: {
      type: Number,
      default: 1,
      min: [0, 'Stock cannot be negative'],
    },
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
    },
    tags: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'Cannot have more than 20 tags',
      },
    },
    featured: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'sold', 'inactive', 'pending'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1, status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ featured: -1, status: 1 });
productSchema.index({ 'location.city': 1, 'location.state': 1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

// CRITICAL: Pre-save middleware to generate SKU using assignment seed
productSchema.pre('save', function (next) {
  // Only generate SKU if it doesn't exist
  if (!this.sku && this.isNew) {
    const seed = process.env.ASSIGNMENT_SEED || 'GHW25-DEFAULT';

    // Create a unique string combining seed and document ID
    const uniqueString = seed + this._id.toString();

    // Generate MD5 hash
    const hash = crypto.createHash('md5').update(uniqueString).digest('hex');

    // Take first 8 characters as checksum and convert to uppercase
    const checksum = hash.substring(0, 8).toUpperCase();

    // Create SKU format: PRD-{CHECKSUM}
    this.sku = `PRD-${checksum}`;

    console.log(
      `Generated SKU for product ${this._id}: ${this.sku} using seed: ${seed}`
    );
  }

  // Update timestamp on save
  this.updatedAt = new Date();

  next();
});

// Pre-update middleware to update timestamp
productSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Instance methods
productSchema.methods.incrementViews = function () {
  this.views = (this.views || 0) + 1;
  return this.save();
};

productSchema.methods.toggleLike = function (userId) {
  const userIndex = this.likes.indexOf(userId);
  if (userIndex > -1) {
    this.likes.splice(userIndex, 1);
    return { liked: false, count: this.likes.length };
  } else {
    this.likes.push(userId);
    return { liked: true, count: this.likes.length };
  }
};

productSchema.methods.isLikedBy = function (userId) {
  return this.likes.includes(userId);
};

productSchema.methods.canBeEditedBy = function (userId) {
  return this.seller.toString() === userId.toString();
};

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }
  return 0;
});

// Virtual for like count
productSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// Static methods
productSchema.statics.findActiveProducts = function (query = {}) {
  return this.find({ ...query, status: 'active' });
};

productSchema.statics.findByCategory = function (category) {
  return this.find({ category, status: 'active' });
};

productSchema.statics.findBySeller = function (sellerId) {
  return this.find({ seller: sellerId });
};

productSchema.statics.findFeatured = function () {
  return this.find({ featured: true, status: 'active' });
};

productSchema.statics.searchProducts = function (searchTerm) {
  return this.find({
    $and: [
      { status: 'active' },
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        ],
      },
    ],
  });
};

// Ensure virtual fields are serialized
productSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    // Remove sensitive information
    delete ret.__v;
    return ret;
  },
});

productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
