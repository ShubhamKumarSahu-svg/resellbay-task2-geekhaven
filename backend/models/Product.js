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

productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1, status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ featured: -1, status: 1 });
productSchema.index({ 'location.city': 1, 'location.state': 1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

productSchema.pre('save', function (next) {
  if (!this.sku && this.isNew) {
    const seed = process.env.ASSIGNMENT_SEED || 'GHW25-DEFAULT';

    const uniqueString = seed + this._id.toString();

    const hash = crypto.createHash('md5').update(uniqueString).digest('hex');

    const checksum = hash.substring(0, 8).toUpperCase();

    this.sku = `PRD-${checksum}`;

    console.log(
      `Generated SKU for product ${this._id}: ${this.sku} using seed: ${seed}`
    );
  }

  this.updatedAt = new Date();

  next();
});

productSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('Product', productSchema);
