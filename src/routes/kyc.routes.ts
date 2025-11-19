import { Router } from 'express';
import * as kycController from '../controllers/kyc.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' }); // Temp storage
const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/kyc/submit:
 *   post:
 *     summary: Submit KYC information
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               postal_code:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               occupation:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC submitted successfully
 */
router.post('/submit', kycController.submitKyc);

/**
 * @swagger
 * /api/v1/kyc/document/upload:
 *   post:
 *     summary: Upload KYC document
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - document_type
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               document_type:
 *                 type: string
 *                 enum: [national_id, drivers_license, passport, utility_bill, bank_statement, selfie]
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 */
router.post('/document/upload', upload.single('file'), kycController.uploadDocument);

export default router;
