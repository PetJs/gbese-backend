import prisma from '../config/db.js';
import { createNotification } from './analytics.service.js';

export const getAccountBalance = async (userId: string) => {
    const account = await prisma.account.findUnique({
        where: { user_id: userId },
    });

    if (!account) {
        throw { statusCode: 404, message: 'Account not found' };
    }

    const availableCredit = Number(account.credit_limit) - Number(account.total_debt_obligation) - Number(account.pending_transfers_out);
    const dailyLimit = Number(account.daily_transfer_limit);
    const dailyUsed = Number(account.daily_transfer_amount);

    return {
        account_number: account.account_number,
        current_balance: account.current_balance,
        credit_limit: account.credit_limit,
        total_debt_obligation: account.total_debt_obligation,
        pending_transfers_out: account.pending_transfers_out,
        pending_transfers_in: account.pending_transfers_in,
        available_credit: availableCredit,
        currency: account.currency,
        account_type: account.account_type,
        daily_transfer_limit: account.daily_transfer_limit,
        daily_transfers_used: account.daily_transfer_amount,
        daily_transfers_remaining: dailyLimit - dailyUsed
    };
};

export const updateAccountLimits = async (userId: string, data: any) => {
    const { daily_transfer_limit } = data;

    const account = await prisma.account.findUnique({
        where: { user_id: userId }
    });

    if (!account) {
        throw { statusCode: 404, message: 'Account not found' };
    }

    const updated = await prisma.account.update({
        where: { id: account.id },
        data: { daily_transfer_limit }
    });

    return {
        daily_transfer_limit: updated.daily_transfer_limit,
        daily_transfer_amount: updated.daily_transfer_amount
    };
};

export const getTransactions = async (userId: string, query: any) => {
    const { page = 1, limit = 20, type, status, start_date, end_date, sort } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
        OR: [
            { sender_id: userId },
            { recipient_id: userId }
        ]
    };

    if (type) where.type = type;
    if (status) where.status = status;
    if (start_date && end_date) {
        where.created_at = {
            gte: new Date(start_date),
            lte: new Date(end_date)
        };
    }

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: sort ? { [sort.split(':')[0]]: sort.split(':')[1] } : { created_at: 'desc' },
            include: {
                sender: { select: { id: true, first_name: true, last_name: true } },
                recipient: { select: { id: true, first_name: true, last_name: true } },
                sender_account: { select: { account_number: true } },
                recipient_account: { select: { account_number: true } }
            }
        }),
        prisma.transaction.count({ where })
    ]);

    const formattedTransactions = transactions.map(tx => ({
        id: tx.id,
        reference_number: tx.reference_number,
        type: tx.type,
        amount: tx.amount,
        fee: tx.fee,
        status: tx.status,
        description: tx.description,
        sender: tx.sender ? {
            id: tx.sender.id,
            name: `${tx.sender.first_name} ${tx.sender.last_name}`,
            account_number: tx.sender_account?.account_number
        } : null,
        recipient: tx.recipient ? {
            id: tx.recipient.id,
            name: `${tx.recipient.first_name} ${tx.recipient.last_name}`,
            account_number: tx.recipient_account?.account_number
        } : null,
        initiated_at: tx.initiated_at,
        completed_at: tx.completed_at
    }));

    return {
        transactions: formattedTransactions,
        pagination: {
            current_page: Number(page),
            per_page: Number(limit),
            total_records: total,
            total_pages: Math.ceil(total / Number(limit))
        }
    };
};

export const getTransactionByRef = async (userId: string, reference: string) => {
    const tx = await prisma.transaction.findUnique({
        where: { reference_number: reference },
        include: {
            sender: { select: { id: true, first_name: true, last_name: true } },
            recipient: { select: { id: true, first_name: true, last_name: true } },
            sender_account: { select: { account_number: true } },
            recipient_account: { select: { account_number: true } }
        }
    });

    if (!tx) {
        throw { statusCode: 404, message: 'Transaction not found' };
    }

    if (tx.sender_id !== userId && tx.recipient_id !== userId) {
        throw { statusCode: 403, message: 'Unauthorized access to transaction' };
    }

    return {
        id: tx.id,
        reference_number: tx.reference_number,
        type: tx.type,
        amount: tx.amount,
        fee: tx.fee,
        status: tx.status,
        description: tx.description,
        sender: tx.sender ? {
            id: tx.sender.id,
            name: `${tx.sender.first_name} ${tx.sender.last_name}`,
            account_number: tx.sender_account?.account_number
        } : null,
        recipient: tx.recipient ? {
            id: tx.recipient.id,
            name: `${tx.recipient.first_name} ${tx.recipient.last_name}`,
            account_number: tx.recipient_account?.account_number
        } : null,
        metadata: tx.metadata,
        initiated_at: tx.initiated_at,
        completed_at: tx.completed_at
    };
};

export const requestLimitIncrease = async (userId: string, requestedLimit: number) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { account: true }
    });

    if (!user) throw { statusCode: 404, message: 'User not found' };
    if (!user.account) throw { statusCode: 404, message: 'Account not found' };

    // 1. Check KYC Status
    if (user.kyc_status !== 'verified') {
        throw { statusCode: 400, message: 'KYC verification required for limit increase' };
    }

    // 2. Validate Limit (MVP Cap: 1,000,000)
    const MAX_LIMIT = 1000000;
    if (requestedLimit > MAX_LIMIT) {
        throw { statusCode: 400, message: `Requested limit exceeds maximum allowed (${MAX_LIMIT})` };
    }

    if (requestedLimit <= Number(user.account.credit_limit)) {
        throw { statusCode: 400, message: 'Requested limit must be higher than current limit' };
    }

    // 3. Update Limit (Auto-approve for MVP)
    const updatedAccount = await prisma.account.update({
        where: { id: user.account.id },
        data: {
            credit_limit: requestedLimit
        }
    });

    // 4. Send Notification
    await createNotification(
        userId,
        'system_alert',
        'Credit Limit Increased',
        `Your credit limit has been increased to ${requestedLimit}.`,
        '/account'
    );

    return {
        account_number: updatedAccount.account_number,
        previous_limit: user.account.credit_limit,
        new_limit: updatedAccount.credit_limit,
        message: 'Credit limit updated successfully'
    };
};
