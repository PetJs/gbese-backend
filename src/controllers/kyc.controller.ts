import { Request, Response, NextFunction } from 'express';
import * as kycService from '../services/kyc.service.js';
import { kycSubmitSchema } from '../utils/validation.js';

interface AuthRequest extends Request {
    user?: any;
    file?: any;
}

export const submitKyc = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { error } = kycSubmitSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }

        const result = await kycService.submitKycInfo(req.user.id, req.body);
        res.status(200).json({
            success: true,
            data: result,
            message: 'KYC information submitted. Please upload verification documents.'
        });
    } catch (error) {
        next(error);
    }
};

export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }

        const { document_type } = req.body;
        if (!document_type) {
            res.status(400).json({ success: false, message: 'Document type is required' });
            return;
        }

        const result = await kycService.uploadKycDocument(req.user.id, req.file, document_type);
        res.status(201).json({
            success: true,
            data: result,
            message: 'Document uploaded successfully. Under review.'
        });
    } catch (error) {
        next(error);
    }
};
