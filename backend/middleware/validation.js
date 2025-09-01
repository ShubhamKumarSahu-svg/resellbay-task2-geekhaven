const { body, query, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => ({
    field: err.param,
    message: err.msg,

    value: err.value,
  }));

  return res.status(400).json({
    message: 'Validation Error',
    errors: extractedErrors,
  });
};

const userRegistrationRules = () => [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters.')
    .notEmpty()
    .withMessage('Name is required.'),
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address.')
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.')
    .notEmpty()
    .withMessage('Password is required.'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Must be a valid phone number.'),
];

const userLoginRules = () => [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

const userProfileUpdateRules = () => [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters.'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Must be a valid phone number.'),
  body('profileImage')
    .optional()
    .trim()
    .isURL()
    .withMessage('Profile image must be a valid URL.'),
  body('address.street')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 200 }),
  body('address.city')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 }),
  body('address.state')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 }),
  body('address.zipCode')
    .optional({ checkFalsy: true })
    .trim()
    .isPostalCode('any'),
  body('address.country')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 }),
];

const productRules = () => [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be 3-200 characters.'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be 10-2000 characters.'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number.'),
  body('originalPrice')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .custom((value, { req }) => {
      if (parseFloat(value) <= parseFloat(req.body.price)) {
        throw new Error(
          'Original price must be greater than the current price.'
        );
      }
      return true;
    }),
  body('category').isIn([
    'Electronics',
    'Clothing',
    'Books',
    'Home',
    'Sports',
    'Other',
  ]),
  body('condition').isIn(['New', 'Like New', 'Good', 'Fair', 'Poor']),
  body('stock')
    .optional()
    .default(1)
    .isInt({ min: 1, max: 9999 })
    .withMessage('Stock must be between 1 and 9999.'),

  body('tags')
    .optional()
    .default([])
    .isArray({ max: 20 })
    .withMessage('Cannot have more than 20 tags.'),

  body('images')
    .optional()
    .default([])
    .isArray({ max: 10 })
    .withMessage('Cannot have more than 10 images.'),
];

const cartItemRules = () => [
  body('productId').isMongoId().withMessage('Invalid product ID format.'),
  body('quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be between 1 and 99.'),
];

const cartUpdateRules = () => [
  body('quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('Quantity must be between 1 and 99.'),
];

const checkoutRules = () => [
  body('shippingAddress').exists().withMessage('Shipping address is required.'),
  body('shippingAddress.street').trim().isLength({ min: 5, max: 200 }),
  body('shippingAddress.city').trim().isLength({ min: 2, max: 50 }),
  body('shippingAddress.state').trim().isLength({ min: 2, max: 50 }),
  body('shippingAddress.zipCode').trim().isPostalCode('any'),
  body('shippingAddress.country').trim().default('India'),
];

const sellerReviewRules = () => [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5.'),
  body('comment').optional().trim().isLength({ max: 1000 }),
];

const productReviewRules = () => [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5.'),
  body('comment').optional().trim().isLength({ max: 1000 }),
  body('productId').isMongoId().withMessage('Invalid product ID format.'),
];

const createChatRules = () => [
  body('participantId')
    .isMongoId()
    .withMessage('Invalid participant ID format.'),
  body('productId')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID format.'),
];

const messageRules = () => [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content is required.'),
];

module.exports = {
  validate,
  userRegistrationRules,
  userLoginRules,
  userProfileUpdateRules,
  productRules,
  cartItemRules,
  cartUpdateRules,
  checkoutRules,
  sellerReviewRules,
  productReviewRules,
  createChatRules,
  messageRules,
};
