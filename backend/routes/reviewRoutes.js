// reviewRoutes.js - Updated with comprehensive Swagger docs
const express = require('express');
const {
  createSellerReview,
  createProductReview,
  getReviewsForUser,
  getReviewsForProduct,
} = require('../controllers/reviewController');
const {
  authenticateToken,
  requireVerification,
} = require('../middleware/auth');
const {
  validate,
  sellerReviewRules,
  productReviewRules,
} = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Reviews
 *     description: API for managing product and seller reviews
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The review ID
 *           example: "64f1c2d6b1234e001a2b3c4d"
 *         reviewType:
 *           type: string
 *           enum: [User, Product]
 *           description: Type of review (User or Product)
 *           example: "User"
 *         subject:
 *           type: string
 *           description: ID of the user or product being reviewed
 *           example: "64f1c2d6b1234e001a2b3c4d"
 *         reviewer:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "64f1c2d6b1234e001a2b3c4d"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             profileImage:
 *               type: string
 *               example: "https://example.com/profile.jpg"
 *         order:
 *           type: string
 *           description: ID of the order associated with the review
 *           example: "64f1c2d6b1234e001a2b3c4d"
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating from 1 to 5 stars
 *           example: 5
 *         comment:
 *           type: string
 *           description: Review comment text
 *           example: "Excellent service!"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-08-31T07:45:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-08-31T07:45:00.000Z"
 *     ReviewInput:
 *       type: object
 *       required:
 *         - rating
 *       properties:
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         comment:
 *           type: string
 *           example: "Excellent service!"
 *         productId:
 *           type: string
 *           description: Required for product reviews only
 *           example: "64f1c2d6b1234e001a2b3c4d"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "User not found"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: "rating"
 *               message:
 *                 type: string
 *                 example: "Rating must be between 1 and 5."
 *               value:
 *                 type: any
 *                 example: 6
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get all reviews for a specific user
 *     description: Retrieve all reviews left for a user (seller)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to get reviews for
 *     responses:
 *       200:
 *         description: Successfully retrieved user reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/users/:userId', getReviewsForUser);

/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     summary: Get all reviews for a specific product
 *     description: Retrieve all reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to get reviews for
 *     responses:
 *       200:
 *         description: Successfully retrieved product reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/products/:productId', getReviewsForProduct);

/**
 * @swagger
 * /orders/{orderId}/seller:
 *   post:
 *     summary: Create a seller review for an order
 *     description: Submit a review for a seller based on a completed order
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       201:
 *         description: Seller review submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Seller review submitted successfully."
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error or already reviewed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized to review this order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post(
  '/orders/:orderId/seller',
  authenticateToken,
  requireVerification,
  sellerReviewRules(),
  validate,
  createSellerReview
);

/**
 * @swagger
 * /orders/{orderId}/product:
 *   post:
 *     summary: Create a product review for an order
 *     description: Submit a review for a product based on a completed order
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ReviewInput'
 *               - type: object
 *                 required:
 *                   - productId
 *                 properties:
 *                   productId:
 *                     type: string
 *                     example: "64f1c2d6b1234e001a2b3c4d"
 *     responses:
 *       201:
 *         description: Product review submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product review submitted successfully."
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error, product not in order, or already reviewed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized to review this order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post(
  '/orders/:orderId/product',
  authenticateToken,
  requireVerification,
  productReviewRules(),
  validate,
  createProductReview
);

module.exports = router;
