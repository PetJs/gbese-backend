import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../utils/validation.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }

        const result = await authService.registerUser(req.body);
        res.status(201).json({
            success: true,
            data: result,
            message: 'Registration successful. Please verify your email/phone.',
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }

        const result = await authService.loginUser(req.body);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
