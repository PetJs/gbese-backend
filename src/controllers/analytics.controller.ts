import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await analyticsService.getNotifications(req.user.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const markRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await analyticsService.markNotificationRead(req.user.id, req.params.notification_id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await analyticsService.markAllNotificationsRead(req.user.id);
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};

export const getImpact = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await analyticsService.getImpactMetrics(req.user.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const getPrediction = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await analyticsService.getCreditPrediction(req.user.id);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const webhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await analyticsService.handleWebhook(req.body);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};
