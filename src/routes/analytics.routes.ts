import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Notifications
/**
 * @swagger
 * /api/v1/analytics/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
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
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/notifications', authenticate, analyticsController.getNotifications);

/**
 * @swagger
 * /api/v1/analytics/notifications/{notification_id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.put('/notifications/:notification_id/read', authenticate, analyticsController.markRead);

/**
 * @swagger
 * /api/v1/analytics/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put('/notifications/read-all', authenticate, analyticsController.markAllRead);

// Analytics
/**
 * @swagger
 * /api/v1/analytics/analytics/impact:
 *   get:
 *     summary: Get user impact analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User impact metrics
 */
router.get('/analytics/impact', authenticate, analyticsController.getImpact);

/**
 * @swagger
 * /api/v1/analytics/analytics/prediction:
 *   get:
 *     summary: Get credit prediction analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Credit prediction data
 */
router.get('/analytics/prediction', authenticate, analyticsController.getPrediction);

// Webhooks (No auth middleware, usually signature verification)
/**
 * @swagger
 * /api/v1/analytics/webhooks/credit_decision:
 *   post:
 *     summary: Webhook for credit decision callbacks
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               application_id:
 *                 type: string
 *               status:
 *                 type: string
 *               approved_amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post('/webhooks/credit_decision', analyticsController.webhook);

export default router;
