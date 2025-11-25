import { Request, Response, NextFunction } from 'express';
import * as debtService from '../services/debt.service.js';
import { paymentScheduleSchema } from '../utils/validation.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getObligations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await debtService.getDebtObligations(req.user.id, req.query);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getObligation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await debtService.getObligationDetails(req.user.id, req.params.obligation_id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const schedulePayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { error } = paymentScheduleSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }

        const result = await debtService.schedulePayment(req.user.id, req.body);
        res.status(201).json({ success: true, data: result, message: 'Payment scheduled successfully' });
    } catch (error) {
        next(error);
    }
};

export const repayDebt = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Basic validation for now, or use a schema if available
        if (!req.body.obligation_id || !req.body.amount) {
            res.status(400).json({ success: false, message: 'obligation_id and amount are required' });
            return;
        }

        const result = await debtService.repayDebt(req.user.id, req.body);
        res.status(200).json({ success: true, data: result, message: 'Debt repayment processed' });
    } catch (error) {
        next(error);
    }
};
