const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/auth');
const AppError = require('../utils/AppError');
const { calculatePlatformFee } = require('../utils/feeCalculator');
const { generateHMACSignature } = require('../utils/hmacSignature');

exports.processCheckout = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = 'cash_on_delivery' } = req.body;
  const userId = req.user._id;

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
    throw new AppError('Complete shipping address is required', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product')
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    let subtotal = 0;
    const stockUpdates = [];
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product || product.status !== 'active') {
        throw new AppError(
          `Product "${product?.title || 'Unknown'}" is no longer available`,
          400
        );
      }

      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for "${product.title}". Only ${
            product.stock
          } available`,
          400
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        title: product.title,
        seller: product.seller,
      });

      stockUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $inc: { stock: -item.quantity, sold: item.quantity } },
        },
      });
    }

    const platformFee = calculatePlatformFee(subtotal);
    const total = subtotal + platformFee;

    const orderArray = await Order.create(
      [
        {
          buyer: userId,
          items: orderItems,
          subtotal,
          platformFee,
          total,
          shippingAddress,
          paymentMethod,
          status: 'pending',
        },
      ],
      { session }
    );
    const order = orderArray[0];

    await Product.bulkWrite(stockUpdates, { session });
    cart.items = [];
    await cart.save({ session });
    await session.commitTransaction();

    const responseBody = {
      success: true,
      message: 'Order placed successfully',
      order: {
        id: order._id,
        total: order.total,
        itemCount: order.items.length,
        status: order.status,
        createdAt: order.createdAt,
      },
    };

    if (req.idempotencyKey) {
      const signature = generateHMACSignature(responseBody);
      req.idempotencyStore?.set(req.idempotencyKey, {
        timestamp: Date.now(),
        response: responseBody,
        signature,
      });
      res.set('X-Signature', signature);
    }

    res.status(201).json(responseBody);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

exports.getTransactionHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;
  const userId = req.user._id;

  const query = { buyer: userId };

  if (
    status &&
    ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(
      status
    )
  ) {
    query.status = status;
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('items.product', 'title images price')
      .populate('items.seller', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum * limitNum < total,
      hasPrevPage: pageNum > 1,
    },
  });
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const order = await Order.findById(id)
    .populate('items.product', 'title images price')
    .populate('items.seller', 'name profileImage email')
    .populate('buyer', 'name email')
    .lean();

  if (!order) throw new AppError('Order not found', 404);

  const isBuyer = order.buyer._id.toString() === userId.toString();
  const isSeller = order.items.some(
    (item) => item.seller._id.toString() === userId.toString()
  );

  if (!isBuyer && !isSeller)
    throw new AppError('You are not authorized to view this order', 403);

  res.status(200).json({ success: true, order });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user._id;

  const validStatuses = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];
  if (!validStatuses.includes(status))
    throw new AppError('Invalid order status', 400);

  const order = await Order.findById(id);
  if (!order) throw new AppError('Order not found', 404);

  const isSeller = order.items.some(
    (item) => item.seller.toString() === userId.toString()
  );
  if (!isSeller)
    throw new AppError('You are not authorized to update this order', 403);

  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: userId,
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    order: {
      id: order._id,
      status: order.status,
      updatedAt: order.updatedAt,
    },
  });
});
