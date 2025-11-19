import { Request, Response, NextFunction } from 'express';
import * as transferService from '../services/transfer.service.js';
import { transferSchema } from '../utils/validation.js';

interface AuthRequest extends Request {
    user?: any;
}

export const transfer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { error } = transferSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }

        // Verify PIN would happen here or via middleware

        const result = await transferService.initiateTransfer(req.user.id, req.body);
        res.status(200).json({
            success: true,
            data: result,
            message: 'Transfer successful'
        });
    } catch (error) {
        next(error);
    }
};
