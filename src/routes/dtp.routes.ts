import { Router } from 'express';
import * as dtpController from '../controllers/dtp.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/dtp/transfer:
 *   post:
 *     summary: Initiate debt transfer request
 *     tags: [DTP]
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
 *             properties:
 *               obligation_id:
 *                 type: string
 *               recipient_id:
 *                 type: string
 *               incentive_amount:
 *                 type: number
 *               transfer_type:
 *                 type: string
 *                 enum: [direct, marketplace]
 *     responses:
 *       201:
 *         description: Transfer request created
 */
router.post('/transfer', dtpController.transferDebt);

/**
 * @swagger
 * /api/v1/dtp/requests/incoming:
 *   get:
 *     summary: Get incoming debt transfer requests
 *     tags: [DTP]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of incoming requests
 */
router.get('/requests/incoming', dtpController.getIncoming);

/**
 * @swagger
 * /api/v1/dtp/requests/outgoing:
 *   get:
 *     summary: Get outgoing debt transfer requests
 *     tags: [DTP]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of outgoing requests
 */
router.get('/requests/outgoing', dtpController.getOutgoing);

/**
 * @swagger
 * /api/v1/dtp/request/{request_id}/accept:
 *   post:
 *     summary: Accept debt transfer request
 *     tags: [DTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request accepted
 */
router.post('/request/:request_id/accept', dtpController.acceptRequest);

/**
 * @swagger
 * /api/v1/dtp/request/{request_id}/reject:
 *   post:
 *     summary: Reject debt transfer request
 *     tags: [DTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request rejected
 */
router.post('/request/:request_id/reject', dtpController.rejectRequest);

/**
 * @swagger
 * /api/v1/dtp/request/{request_id}:
 *   delete:
 *     summary: Cancel debt transfer request
 *     tags: [DTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request cancelled
 */
router.delete('/request/:request_id', dtpController.cancelRequest);

/**
 * @swagger
 * /api/v1/dtp/match:
 *   get:
 *     summary: Find matching debt opportunities
 *     tags: [DTP]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of matches
 */
router.get('/match', dtpController.matchDebt);

/**
 * @swagger
 * /api/v1/dtp/shuffle:
 *   post:
 *     summary: Execute circular debt relief (shuffle)
 *     tags: [DTP]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shuffle executed
 */
router.post('/shuffle', dtpController.shuffleDebt);

export default router;
