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
