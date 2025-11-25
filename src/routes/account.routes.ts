import { Router } from 'express';
import * as accountController from '../controllers/account.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/account/balance:
 *   get:
 *     summary: Get account balance and limits
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account balance retrieved
 */
router.get('/balance', accountController.getBalance);

/**
 * @swagger
 * /api/v1/account/transactions:
 *   get:
 *     summary: Get transaction history
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction list retrieved
 */
router.get('/transactions', accountController.getTransactions);

/**
 * @swagger
 * /api/v1/account/transactions/{reference_number}:
 *   get:
 *     summary: Get transaction by reference number
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference_number
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 */
router.get('/transactions/:reference_number', accountController.getTransaction);

/**
 * @swagger
 * /api/v1/account/limit/increase:
 *   post:
 *     summary: Request credit limit increase
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requested_limit
 *             properties:
 *               requested_limit:
 *                 type: number
 *     responses:
 *       200:
 *         description: Credit limit updated
 */
router.post('/limit/increase', accountController.requestLimitIncrease);

export default router;
