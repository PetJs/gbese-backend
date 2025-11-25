import prisma from '../config/db.js';

export const getNotifications = async (userId: string) => {
    return await prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
    });
};

export const createNotification = async (userId: string, type: any, title: string, message: string, actionUrl?: string) => {
    return await prisma.notification.create({
        data: {
            user_id: userId,
            type,
            title,
            message,
            action_url: actionUrl
        }
    });
};

export const markNotificationRead = async (userId: string, notificationId: string) => {
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
    });

    if (!notification) {
        throw { statusCode: 404, message: 'Notification not found' };
    }

    if (notification.user_id !== userId) {
        throw { statusCode: 403, message: 'Unauthorized' };
    }

    return await prisma.notification.update({
        where: { id: notificationId },
        data: { is_read: true }
    });
};

export const markAllNotificationsRead = async (userId: string) => {
    return await prisma.notification.updateMany({
        where: { user_id: userId, is_read: false },
        data: { is_read: true }
    });
};

export const getImpactMetrics = async (userId: string) => {
    // Placeholder logic for impact metrics
    // In a real app, calculate based on debt relieved, credit score improvement, etc.

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { reputation_score: true }
    });

    return {
        reputation_score: user?.reputation_score || 0,
        debt_relieved: 0, // Mock
        community_rank: 'Top 10%',
        sustainability_score: 85
    };
};

export const getCreditPrediction = async (userId: string) => {
    // Placeholder logic for AI prediction
    return {
        approval_probability: 0.85,
        suggested_amount: 50000,
        factors: ['Good repayment history', 'Stable income']
    };
};

export const handleWebhook = async (event: any) => {
    // Handle external webhooks (e.g., from credit bureau or payment gateway)
    console.log('Webhook received:', event);
    return { received: true };
};
