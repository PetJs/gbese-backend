import { Request, Response, NextFunction } from 'express';
import * as creditService from '../services/credit.service.js';
import { creditApplicationSchema } from '../utils/validation.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getProviders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await creditService.getCreditProviders();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getRates = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await creditService.getCreditRates();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const apply = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { error } = creditApplicationSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }

        const result = await creditService.applyForCredit(req.user.id, req.body);
        res.status(201).json({ success: true, data: result, message: 'Application submitted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await creditService.getApplicationStatus(req.user.id, req.params.application_id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getReputation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await creditService.getUserReputation(req.user.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};
