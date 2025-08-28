const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message:
      'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message:
      'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
});

const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 7,
  message: {
    message: 'Checkout rate limit exceeded. Please try again in a minute.',
  },
});

module.exports = { generalLimiter, authLimiter, checkoutLimiter };
