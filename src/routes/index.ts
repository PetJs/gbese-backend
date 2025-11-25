import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import kycRoutes from './kyc.routes.js';
import accountRoutes from './account.routes.js';
import fundingRoutes from './funding.routes.js';
import transferRoutes from './transfer.routes.js';
import creditRoutes from './credit.routes.js';
import debtRoutes from './debt.routes.js';
import dtpRoutes from './dtp.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/kyc', kycRoutes);
router.use('/account', accountRoutes);
router.use('/funding', fundingRoutes);
router.use('/transfer', transferRoutes);
router.use('/credit', creditRoutes);
router.use('/debt', debtRoutes);
router.use('/dtp', dtpRoutes);
router.use('/analytics', analyticsRoutes);

router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
