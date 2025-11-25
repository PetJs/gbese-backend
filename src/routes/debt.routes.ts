import { Router } from 'express';
import * as debtController from '../controllers/debt.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/debt/obligations:
 *   get:
 *     summary: Get all debt obligations
 *     tags: [Debt]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of debt obligations
 */
router.get('/obligations', debtController.getObligations);

/**
 * @swagger
 * /api/v1/debt/obligations/{obligation_id}:
 *   get:
 *     summary: Get debt obligation details
 *     tags: [Debt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: obligation_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Debt obligation details
 */
router.get('/obligations/:obligation_id', debtController.getObligation);

/**
 * @swagger
 * /api/v1/debt/payments/schedule:
 *   post:
 *     summary: Schedule recurring payment for debt
 *     tags: [Debt]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - obligation_id
 *               - amount
 *               - frequency
 *             properties:
 *               obligation_id:
 *                 type: string
 *               amount:
 *                 type: number
 *               frequency:
 *                 type: string
 *                 enum: [weekly, biweekly, monthly]
 *               start_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Payment schedule created
 */
router.post('/payments/schedule', debtController.schedulePayment);

/**
 * @swagger
 * /api/v1/debt/repay:
 *   post:
 *     summary: Repay debt obligation
 *     tags: [Debt]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - obligation_id
 *               - amount
 *             properties:
 *               obligation_id:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Repayment processed
 */
router.post('/repay', debtController.repayDebt);

export default router;
