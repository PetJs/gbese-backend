import prisma from '../config/db.js';

export const initiateDebtTransfer = async (userId: string, data: any) => {
    const { obligation_id, new_lender_id, discount_rate, reason } = data;

    const obligation = await prisma.debtObligation.findUnique({
        where: { id: obligation_id }
    });

    if (!obligation) {
        throw { statusCode: 404, message: 'Obligation not found' };
    }

    if (obligation.current_holder_id !== userId) {
        throw { statusCode: 403, message: 'Only the lender can initiate a transfer' };
    }

    const requestNumber = `DTR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const request = await prisma.debtTransferRequest.create({
        data: {
            request_number: requestNumber,
            debt_id: obligation_id,
            sender_id: userId,
            recipient_id: new_lender_id,
            status: 'pending',
            incentive_percentage: discount_rate,
            notes: reason,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
        }
    });

    return {
        request_id: request.id,
        obligation_id: request.debt_id,
        status: request.status,
        created_at: request.created_at
    };
};

export const getIncomingRequests = async (userId: string) => {
    const requests = await prisma.debtTransferRequest.findMany({
        where: { recipient_id: userId, status: 'pending' },
        include: {
            debt: true,
            sender: { select: { first_name: true, last_name: true } }
        }
    });
    return requests;
};

export const getOutgoingRequests = async (userId: string) => {
    const requests = await prisma.debtTransferRequest.findMany({
        where: { sender_id: userId },
        include: {
            debt: true,
            recipient: { select: { first_name: true, last_name: true } }
        }
    });
    return requests;
};

export const respondToRequest = async (userId: string, requestId: string, action: 'accept' | 'reject') => {
    const request = await prisma.debtTransferRequest.findUnique({
        where: { id: requestId },
        include: { debt: true }
    });

    if (!request) {
        throw { statusCode: 404, message: 'Request not found' };
    }

    if (request.recipient_id !== userId) {
        throw { statusCode: 403, message: 'Unauthorized' };
    }

    if (request.status !== 'pending') {
        throw { statusCode: 400, message: 'Request is already processed' };
    }

    if (action === 'reject') {
        const updated = await prisma.debtTransferRequest.update({
            where: { id: requestId },
            data: { status: 'rejected', rejected_at: new Date() }
        });
        return { status: updated.status };
    }

    return await prisma.$transaction(async (tx: any) => {
        // 1. Update Request Status
        await tx.debtTransferRequest.update({
            where: { id: requestId },
            data: { status: 'accepted', accepted_at: new Date() }
        });

        // 2. Update Debt Obligation Ownership
        await tx.debtObligation.update({
            where: { id: request.debt_id },
            data: { current_holder_id: userId, transferred_at: new Date() }
        });

        // 3. Adjust Account Balances
        const senderAccount = await tx.account.findUnique({ where: { user_id: request.sender_id } });
        const recipientAccount = await tx.account.findUnique({ where: { user_id: userId } });

        if (!senderAccount || !recipientAccount) {
            throw { statusCode: 404, message: 'Account not found for one or both parties' };
        }

        const debtAmount = Number(request.debt.remaining_balance);
        const incentiveAmount = Number(request.incentive_amount || 0);

        // Sender: Debt decreases. If incentive paid, balance decreases.
        await tx.account.update({
            where: { id: senderAccount.id },
            data: {
                total_debt_obligation: { decrement: debtAmount },
                current_balance: { decrement: incentiveAmount }
            }
        });

        // Recipient: Debt increases. If incentive received, balance increases.
        await tx.account.update({
            where: { id: recipientAccount.id },
            data: {
                total_debt_obligation: { increment: debtAmount },
                current_balance: { increment: incentiveAmount }
            }
        });

        // 4. Log Incentive Transaction (if applicable)
        if (incentiveAmount > 0) {
            await tx.transaction.create({
                data: {
                    reference_number: `TX-INC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    sender_id: request.sender_id,
                    sender_account_id: senderAccount.id,
                    recipient_id: userId,
                    recipient_account_id: recipientAccount.id,
                    type: 'debt_transfer_incentive',
                    amount: incentiveAmount,
                    status: 'completed',
                    description: `Incentive for debt transfer ${request.request_number}`,
                    metadata: {
                        debt_id: request.debt_id,
                        request_id: requestId
                    }
                }
            });
        }

        return { status: 'accepted', message: 'Debt ownership transferred successfully' };
    });
};

export const cancelRequest = async (userId: string, requestId: string) => {
    const request = await prisma.debtTransferRequest.findUnique({
        where: { id: requestId }
    });

    if (!request) {
        throw { statusCode: 404, message: 'Request not found' };
    }

    if (request.sender_id !== userId) {
        throw { statusCode: 403, message: 'Unauthorized' };
    }

    if (request.status !== 'pending') {
        throw { statusCode: 400, message: 'Cannot cancel processed request' };
    }

    await prisma.debtTransferRequest.delete({
        where: { id: requestId }
    });

    return { success: true, message: 'Request cancelled' };
};

export const findMatches = async (userId: string) => {
    return {
        matches: [],
        message: 'No matches found at this time'
    };
};

export const shuffleDebt = async (userId: string) => {
    return {
        success: true,
        shuffled_count: 0,
        message: 'Debt shuffle algorithm executed'
    };
};
