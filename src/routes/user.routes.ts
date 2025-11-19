import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /api/v1/user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', userController.updateProfile);

/**
 * @swagger
 * /api/v1/user/pin/create:
 *   post:
 *     summary: Create transaction PIN
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pin
 *             properties:
 *               pin:
 *                 type: string
 *     responses:
 *       200:
 *         description: PIN created
 */
router.post('/pin/create', userController.createPin);

/**
 * @swagger
 * /api/v1/user/pin/change:
 *   post:
 *     summary: Change transaction PIN
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - old_pin
 *               - new_pin
 *             properties:
 *               old_pin:
 *                 type: string
 *               new_pin:
 *                 type: string
 *     responses:
 *       200:
 *         description: PIN changed
 */
router.post('/pin/change', userController.changePin);

/**
 * @swagger
 * /api/v1/user/2fa/enable:
 *   post:
 *     summary: Enable 2FA
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA enabled, returns QR code
 */
router.post('/2fa/enable', userController.enable2FA);

/**
 * @swagger
 * /api/v1/user/2fa/verify:
 *   post:
 *     summary: Verify 2FA token
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA verified
 */
router.post('/2fa/verify', userController.verify2FA);

export default router;
