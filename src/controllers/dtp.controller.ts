import { Request, Response, NextFunction } from 'express';
import * as dtpService from '../services/dtp.service.js';
import { debtTransferSchema } from '../utils/validation.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const transferDebt = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { error } = debtTransferSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }

        const result = await dtpService.initiateDebtTransfer(req.user.id, req.body);
        res.status(201).json({ success: true, data: result, message: 'Transfer request sent' });
    } catch (error) {
        next(error);
    }
};

export const getIncoming = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await dtpService.getIncomingRequests(req.user.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getOutgoing = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await dtpService.getOutgoingRequests(req.user.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const acceptRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await dtpService.respondToRequest(req.user.id, req.params.request_id, 'accept');
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const rejectRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await dtpService.respondToRequest(req.user.id, req.params.request_id, 'reject');
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const cancelRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await dtpService.cancelRequest(req.user.id, req.params.request_id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const matchDebt = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await dtpService.findMatches(req.user.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const shuffleDebt = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await dtpService.shuffleDebt(req.user.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};
