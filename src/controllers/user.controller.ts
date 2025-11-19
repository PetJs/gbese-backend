import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import { updateProfileSchema, createPinSchema, changePinSchema, verify2FASchema } from '../utils/validation.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getUserProfile(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { error } = updateProfileSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }

        const user = await userService.updateUserProfile(req.user.id, req.body);
        res.status(200).json({ success: true, data: user, message: 'Profile updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const createPin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { error } = createPinSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }

        const result = await userService.createTransactionPin(req.user.id, req.body);
        res.status(201).json({ success: true, message: result.message });
    } catch (error) {
        next(error);
    }
};

export const changePin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { error } = changePinSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }

        const result = await userService.changeTransactionPin(req.user.id, req.body);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        next(error);
    }
};

export const enable2FA = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await userService.enable2FA(req.user.id);
        res.status(200).json({ success: true, data: result, message: 'Scan QR code with authenticator app' });
    } catch (error) {
        next(error);
    }
};

export const verify2FA = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { error } = verify2FASchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }

        const result = await userService.verify2FA(req.user.id, req.body.code);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        next(error);
    }
};
