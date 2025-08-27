const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { getCartSummary } = require('../utils/cartUtils');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/auth');

const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const getAndCleanCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    populate: { path: 'seller', select: 'name' },
  });

  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
    await cart.save();
    return cart;
  }

  const originalItemCount = cart.items.length;
  cart.items = cart.items.filter(
    (item) => item.product && item.product.status === 'active'
  );

  let hasChanges = false;
  cart.items.forEach((item) => {
    if (item.quantity > item.product.stock) {
      item.quantity = Math.max(1, item.product.stock);
      hasChanges = true;
    }
  });

  if (hasChanges || cart.items.length < originalItemCount) {
    await cart.save();
  }

  return cart;
};

exports.getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const cart = await findOrCreateCart(userId);
  await cart.populate({
    path: 'items.product',
    select: 'title price images stock seller',
    populate: { path: 'seller', select: 'name' },
  });

  res.status(200).json({
    success: true,
    cart: cart.items.length > 0 ? cart : null,
    summary: getCartSummary(cart),
  });
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user._id;

  if (!productId || quantity < 1) {
    throw new AppError('Valid Product ID and quantity are required.', 400);
  }

  const product = await Product.findById(productId);
  if (!product || product.status !== 'active') {
    throw new AppError('Product not found or is unavailable.', 404);
  }

  if (product.stock < quantity) {
    throw new AppError('Insufficient stock.', 400);
  }

  const cart = await findOrCreateCart(userId);
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate({
    path: 'items.product',
    select: 'title price images stock seller',
    populate: { path: 'seller', select: 'name' },
  });

  res.status(200).json({
    success: true,
    message: `"${product.title}" added to cart.`,
    cart,
    summary: getCartSummary(cart),
  });
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  if (quantity < 1) {
    return exports.removeCartItem(req, res);
  }

  const cart = await findOrCreateCart(userId);
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new AppError('Item not found in cart.', 404);

  item.quantity = quantity;
  await cart.save();
  await cart.populate({
    path: 'items.product',
    select: 'title price images stock seller',
    populate: { path: 'seller', select: 'name' },
  });

  res.status(200).json({
    success: true,
    message: 'Cart updated.',
    cart,
    summary: getCartSummary(cart),
  });
});

exports.removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  const cart = await findOrCreateCart(userId);
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();
  await cart.populate({
    path: 'items.product',
    select: 'title price images stock seller',
    populate: { path: 'seller', select: 'name' },
  });

  res.status(200).json({
    success: true,
    message: 'Item removed from cart.',
    cart: cart.items.length > 0 ? cart : null,
    summary: getCartSummary(cart),
  });
});

exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully',
    cart: null,
    summary: { itemCount: 0, subtotal: 0 },
  });
});
