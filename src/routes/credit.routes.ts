import { Router } from 'express';
import * as creditController from '../controllers/credit.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/credit/providers:
 *   get:
 *     summary: List all active credit providers
 *     tags: [Credit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of credit providers
 */
router.get('/providers', creditController.getProviders);

/**
 * @swagger
 * /api/v1/credit/rates:
 *   get:
 *     summary: Get credit interest rates
 *     tags: [Credit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Interest rates by provider
 */
router.get('/rates', creditController.getRates);

/**
 * @swagger
 * /api/v1/credit/apply:
 *   post:
 *     summary: Apply for credit
 *     tags: [Credit]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider_id
 *               - amount
 *               - tenure_months
 *             properties:
 *               provider_id:
 *                 type: string
 *               amount:
 *                 type: number
 *               tenure_months:
 *                 type: integer
 *               purpose:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted
 */
router.post('/apply', creditController.apply);

/**
 * @swagger
 * /api/v1/credit/status/{application_id}:
 *   get:
 *     summary: Check credit application status
 *     tags: [Credit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: application_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application status
 */
router.get('/status/:application_id', creditController.getStatus);

/**
 * @swagger
 * /api/v1/credit/reputation:
 *   get:
 *     summary: Get user credit reputation
 *     tags: [Credit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reputation score and tier
 */
router.get('/reputation', creditController.getReputation);

export default router;
