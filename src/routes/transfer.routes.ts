import { Router } from 'express';
import * as transferController from '../controllers/transfer.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/transfer/gbese:
 *   post:
 *     summary: Transfer funds to another user
 *     tags: [Transfer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient_account_number
 *               - amount
 *             properties:
 *               recipient_account_number:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Transfer successful
 */
router.post('/gbese', transferController.transfer);

export default router;
