const express = require('express');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const checkoutRoutes = require('./checkoutRoutes');
const chatRoutes = require('./chatRoutes');
const reviewRoutes = require('./reviewRoutes');
const orderRoutes = require('./orderRoutes');

const {
  RequestLogger,
  requestLoggerMiddleware,
} = require('../middleware/requestLogger');

module.exports = (io) => {
  const router = express.Router();

  router.use((req, res, next) => {
    req.io = io;
    next();
  });

  const logger = new RequestLogger(200);

  router.use(requestLoggerMiddleware(logger));

  router.use('/auth', authRoutes);
  router.use('/users', userRoutes);
  router.use('/products', productRoutes);
  router.use('/cart', cartRoutes);
  router.use('/checkout', checkoutRoutes);
  router.use('/chat', chatRoutes);
  router.use('/reviews', reviewRoutes);
  router.use('/orders', orderRoutes);

  router.get('/logs', (req, res) => {
    res.status(200).json({ logs: logger.getLogs() });
  });

  return router;
};
