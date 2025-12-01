import { Router } from 'express';
import * as fundingController from '../controllers/funding.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/funding/deposit:
 *   post:
 *     summary: Initiate deposit transaction
 *     tags: [Funding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - method
 *             properties:
 *               amount:
 *                 type: number
 *               method:
 *                 type: string
 *               payment_reference:
 *                 type: string
 *     responses:
 *       200:
 *         description: Deposit initiated
 */
router.post('/deposit', fundingController.deposit);

/**
 * @swagger
 * /api/v1/funding/withdrawal:
 *   post:
 *     summary: Initiate withdrawal transaction
 *     tags: [Funding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - account_number
 *               - bank_code
 *             properties:
 *               amount:
 *                 type: number
 *               account_number:
 *                 type: string
 *               bank_code:
 *                 type: string
 *               narration:
 *                 type: string
 *     responses:
 *       200:
 *         description: Withdrawal initiated
 */
router.post('/withdrawal', fundingController.withdrawal);

export default router;
