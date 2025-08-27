const express = require('express');
const {
  processCheckout,
  getTransactionHistory,
} = require('../controllers/checkoutController');
const {
  authenticateToken,
  requireVerification,
} = require('../middleware/auth');
const { checkIdempotency } = require('../middleware/idempotency');
const { validate, checkoutRules } = require('../middleware/validation');

const router = express.Router();

router.use(authenticateToken, requireVerification);

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Process a new checkout
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutInput'
 *     responses:
 *       201:
 *         description: Checkout processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Checkout'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Duplicate checkout detected (idempotency)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', checkIdempotency, checkoutRules(), validate, processCheckout);

/**
 * @swagger
 * /checkout/history:
 *   get:
 *     summary: Get the transaction history of the current user
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Checkout'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/history', getTransactionHistory);

module.exports = router;
