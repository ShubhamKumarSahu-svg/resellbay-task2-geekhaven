const express = require('express');
const {
  updateProfile,
  getUserProfile,
  becomeSeller,
  getAllSellers,
} = require('../controllers/userController');
const {
  authenticateToken,
  requireVerification,
} = require('../middleware/auth');
const {
  validate,
  userProfileUpdateRules,
} = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /users/sellers:
 *   get:
 *     summary: Get all sellers
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of sellers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/sellers', getAllSellers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getUserProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "John Doe Updated" }
 *               phone: { type: string, example: "+1234567890" }
 *               profileImage: { type: string, example: "https://example.com/profile.jpg" }
 *               address:
 *                 type: object
 *                 properties:
 *                   street: { type: string, example: "123 Main St" }
 *                   city: { type: string, example: "New York" }
 *                   state: { type: string, example: "NY" }
 *                   zipCode: { type: string, example: "10001" }
 *                   country: { type: string, example: "USA" }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 */
router.put(
  '/profile',
  authenticateToken,
  userProfileUpdateRules(),
  validate,
  updateProfile
);

/**
 * @swagger
 * /users/become-seller:
 *   post:
 *     summary: Become a seller
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully became a seller
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Email not verified or already a seller
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/become-seller',
  authenticateToken,
  requireVerification,
  becomeSeller
);

module.exports = router;
