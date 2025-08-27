const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please enter a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function (phone) {
          return /^[\+]?[1-9][\d]{9,14}$/.test(
            phone.replace(/[\s\-\(\)]/g, '')
          );
        },
        message: 'Please enter a valid phone number',
      },
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
        validate: {
          validator: function (zip) {
            return !zip || /^\d{5,6}$/.test(zip);
          },
          message: 'Please enter a valid zip code',
        },
      },
      country: {
        type: String,
        trim: true,
        default: 'India',
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      sparse: true,
    },
    verificationTokenExpires: {
      type: Date,
    },
    role: {
      type: String,
      enum: {
        values: ['buyer', 'seller', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'buyer',
    },
    profileImage: {
      type: String,
      default: null,
      validate: {
        validator: function (url) {
          return !url || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
        },
        message: 'Profile image must be a valid image URL',
      },
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5'],
      },
      count: {
        type: Number,
        default: 0,
        min: [0, 'Rating count cannot be negative'],
      },
    },
    transactionHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    lastLogin: {
      type: Date,
    },
    accountStatus: {
      type: String,
      enum: {
        values: ['active', 'suspended', 'deleted'],
        message: '{VALUE} is not a valid account status',
      },
      default: 'active',
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
      marketingEmails: {
        type: Boolean,
        default: true,
      },
      darkMode: {
        type: Boolean,
        default: false,
      },
      language: {
        type: String,
        default: 'en',
        enum: ['en', 'hi', 'es', 'fr'],
      },
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      sparse: true,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ verificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ role: 1, accountStatus: 1 });
userSchema.index({ 'rating.average': -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// Compound indexes
userSchema.index({ email: 1, accountStatus: 1 });
userSchema.index({ role: 1, isVerified: 1, accountStatus: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to clean up verification token when verified
userSchema.pre('save', function (next) {
  if (this.isModified('isVerified') && this.isVerified) {
    this.verificationToken = undefined;
    this.verificationTokenExpires = undefined;
  }
  next();
});

// Pre-save middleware to normalize email
userSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Make sure password is included in the document
    if (!this.password) {
      const user = await this.constructor
        .findById(this._id)
        .select('+password');
      return await bcrypt.compare(candidatePassword, user.password);
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

userSchema.methods.isVerificationTokenExpired = function () {
  return (
    this.verificationTokenExpires && this.verificationTokenExpires < new Date()
  );
};

userSchema.methods.isPasswordResetTokenExpired = function () {
  return this.passwordResetExpires && this.passwordResetExpires < new Date();
};

userSchema.methods.updateRating = function (newRating) {
  if (newRating < 1 || newRating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = Math.round((totalRating / this.rating.count) * 10) / 10;

  return this.save();
};

userSchema.methods.addToFavorites = function (productId) {
  if (!this.favorites.includes(productId)) {
    this.favorites.push(productId);
    return this.save();
  }
  return Promise.resolve(this);
};

userSchema.methods.removeFromFavorites = function (productId) {
  this.favorites = this.favorites.filter((fav) => !fav.equals(productId));
  return this.save();
};

userSchema.methods.isAccountLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incrementLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isAccountLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

userSchema.methods.canPurchase = function () {
  return (
    this.isVerified &&
    this.accountStatus === 'active' &&
    ['buyer', 'admin'].includes(this.role)
  );
};

userSchema.methods.canSell = function () {
  return (
    this.isVerified &&
    this.accountStatus === 'active' &&
    ['seller', 'admin'].includes(this.role)
  );
};

// Override toJSON to remove sensitive information
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  delete user.verificationTokenExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.loginAttempts;
  delete user.lockUntil;
  delete user.__v;
  return user;
};

// Static methods
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

userSchema.statics.findVerifiedUsers = function (role = null) {
  const query = { isVerified: true, accountStatus: 'active' };
  if (role) query.role = role;
  return this.find(query);
};

userSchema.statics.findByRole = function (role) {
  return this.find({ role, accountStatus: 'active' });
};

userSchema.statics.findSellers = function () {
  return this.find({
    role: 'seller',
    isVerified: true,
    accountStatus: 'active',
  }).select('name email rating profileImage');
};

userSchema.statics.findTopRatedSellers = function (limit = 10) {
  return this.find({
    role: 'seller',
    isVerified: true,
    accountStatus: 'active',
    'rating.count': { $gt: 0 },
  })
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .limit(limit)
    .select('name email rating profileImage');
};

userSchema.statics.getActiveUserStats = function () {
  return this.aggregate([
    { $match: { accountStatus: 'active', isVerified: true } },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating.average' },
        totalTransactions: { $sum: { $size: '$transactionHistory' } },
      },
    },
  ]);
};

// Virtual for full address
userSchema.virtual('fullAddress').get(function () {
  if (!this.address || !this.address.city) return '';

  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode,
    this.address.country,
  ].filter(Boolean);

  return parts.join(', ');
});

// Virtual for user initials
userSchema.virtual('initials').get(function () {
  if (!this.name) return '';
  return this.name
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

// Virtual for account age
userSchema.virtual('accountAge').get(function () {
  if (!this.createdAt) return 0;
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for transaction count
userSchema.virtual('transactionCount').get(function () {
  return this.transactionHistory ? this.transactionHistory.length : 0;
});

// Virtual for favorites count
userSchema.virtual('favoritesCount').get(function () {
  return this.favorites ? this.favorites.length : 0;
});

// Virtual for display rating
userSchema.virtual('displayRating').get(function () {
  if (this.rating.count === 0) return 'No ratings yet';
  return `${
    this.rating.average
  }/5 (${this.rating.count} ${this.rating.count === 1 ? 'review' : 'reviews'})`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    // Remove sensitive fields
    delete ret.password;
    delete ret.verificationToken;
    delete ret.verificationTokenExpires;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    delete ret.__v;
    return ret;
  },
});

userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
