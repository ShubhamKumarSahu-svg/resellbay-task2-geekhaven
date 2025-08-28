const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const authenticateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authorization token is required', 401, 'TOKEN_MISSING');
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id)
    .select('_id email role accountStatus isVerified')
    .lean();

  if (!user) {
    throw new AppError('User no longer exists', 401, 'USER_DELETED');
  }

  if (user.accountStatus !== 'active') {
    throw new AppError(
      `Your account is ${user.accountStatus}. Please contact support.`,
      403,
      'ACCOUNT_INACTIVE'
    );
  }

  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id)
        .select('_id email role accountStatus isVerified')
        .lean();

      if (user?.accountStatus === 'active') {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch {
      req.user = null;
    }
  }
  next();
});

const requireVerification = (req, res, next) => {
  if (!req.user?.isVerified) {
    throw new AppError(
      'Please verify your email to continue',
      403,
      'EMAIL_NOT_VERIFIED'
    );
  }
  next();
};

const requireRole =
  (roles = []) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw new AppError(
        'You do not have permission to perform this action',
        403,
        'FORBIDDEN'
      );
    }
    next();
  };

module.exports = {
  asyncHandler,
  authenticateToken,
  optionalAuth,
  requireVerification,
  requireRole,
};
