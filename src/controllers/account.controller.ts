import { Request, Response, NextFunction } from 'express';
import * as accountService from '../services/account.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getBalance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await accountService.getAccountBalance(req.user.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await accountService.getTransactions(req.user.id, req.query);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await accountService.getTransactionByRef(req.user.id, req.params.reference_number);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const requestLimitIncrease = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { requested_limit } = req.body;
        if (!requested_limit) {
            res.status(400).json({ success: false, message: 'requested_limit is required' });
            return;
        }

        const result = await accountService.requestLimitIncrease(req.user.id, Number(requested_limit));
        res.status(200).json({ success: true, data: result, message: 'Credit limit increase processed' });
    } catch (error) {
        next(error);
    }
};
