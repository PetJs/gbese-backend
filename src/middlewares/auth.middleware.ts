import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        const user = await prisma.user.findUnique({
            where: { id: decoded.user_id },
            select: { id: true, email: true, role: true, kyc_status: true, account_status: true }
        });

        if (!user) {
            res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
            return;
        }

        if (user.account_status !== 'active') {
            res.status(403).json({ success: false, message: `Account is ${user.account_status}` });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};
