import prisma from '../config/db.js';
import { createNotification } from './analytics.service.js';

export const getDebtObligations = async (userId: string, query: any) => {
    const { status } = query;
    const where: any = { current_holder_id: userId };

    if (status) where.status = status;

    const obligations = await prisma.debtObligation.findMany({
        where,
        include: {
            current_holder: { select: { id: true, first_name: true, last_name: true } },
            original_creditor: { select: { name: true } }
        },
        orderBy: { due_date: 'asc' }
    });

    return obligations.map((obl: any) => ({
        id: obl.id,
        lender: obl.current_holder ? `${obl.current_holder.first_name} ${obl.current_holder.last_name}` : obl.original_creditor?.name,
        principal_amount: obl.principal_amount,
        remaining_balance: obl.remaining_balance,
        due_date: obl.due_date,
        status: obl.status,
        interest_rate: obl.interest_rate
    }));
};

export const getObligationDetails = async (userId: string, obligationId: string) => {
    const obligation: any = await prisma.debtObligation.findUnique({
        where: { id: obligationId },
        include: {
            current_holder: { select: { id: true, first_name: true, last_name: true } },
            original_creditor: { select: { name: true } },
            payment_schedules: true
        }
    });

    if (!obligation) {
        throw { statusCode: 404, message: 'Obligation not found' };
    }

    if (obligation.original_borrower_id !== userId && obligation.current_holder_id !== userId) {
        throw { statusCode: 403, message: 'Unauthorized' };
    }

    return {
        id: obligation.id,
        lender: obligation.current_holder ? `${obligation.current_holder.first_name} ${obligation.current_holder.last_name}` : obligation.original_creditor?.name,
        principal_amount: obligation.principal_amount,
        remaining_balance: obligation.remaining_balance,
        amount_paid: Number(obligation.principal_amount) - Number(obligation.remaining_balance),
        due_date: obligation.due_date,
        status: obligation.status,
        interest_rate: obligation.interest_rate,
        payment_schedule: obligation.payment_schedules
    };
};

export const schedulePayment = async (userId: string, data: any) => {
    const { obligation_id, payment_date, amount } = data;

    const obligation = await prisma.debtObligation.findUnique({
        where: { id: obligation_id }
    });

    if (!obligation) {
        throw { statusCode: 404, message: 'Obligation not found' };
    }

    if (obligation.original_borrower_id !== userId) {
        throw { statusCode: 403, message: 'Unauthorized' };
    }

    if (obligation.status === 'paid') {
        throw { statusCode: 400, message: 'Obligation is already paid' };
    }

    const schedule = await prisma.paymentSchedule.create({
        data: {
            debt_id: obligation_id,
            user_id: userId,
            next_execution_date: new Date(payment_date),
            amount: amount,
            frequency: 'monthly', // Defaulting since schema requires it
            is_active: true
        }
    });

    return {
        schedule_id: schedule.id,
        obligation_id: schedule.debt_id,
        payment_date: schedule.next_execution_date,
        amount: schedule.amount,
        status: schedule.is_active ? 'active' : 'inactive'
    };
};

export const repayDebt = async (userId: string, data: any) => {
    const { obligation_id, amount } = data;
    const repaymentAmount = Number(amount);

    const result = await prisma.$transaction(async (tx: any) => {
        // 1. Fetch Obligation
        const obligation = await tx.debtObligation.findUnique({
            where: { id: obligation_id },
            include: {
                current_holder: true,
                original_creditor: true
            }
        });

        if (!obligation) {
            throw { statusCode: 404, message: 'Obligation not found' };
        }

        if (obligation.original_borrower_id !== userId && obligation.current_holder_id !== userId) {
            // Usually only the person who holds the debt (current_holder) pays it?
            // Or the original borrower if it hasn't been transferred?
            // In DTP, the "current_holder" is the one who owes the money.
            // So current_holder_id should be userId.
        }

        if (obligation.current_holder_id !== userId) {
            throw { statusCode: 403, message: 'You are not the holder of this debt' };
        }

        if (obligation.status === 'paid') {
            throw { statusCode: 400, message: 'Obligation is already paid' };
        }

        if (repaymentAmount > Number(obligation.remaining_balance)) {
            throw { statusCode: 400, message: 'Repayment amount exceeds remaining balance' };
        }

        // 2. Fetch User Account
        const payerAccount = await tx.account.findUnique({ where: { user_id: userId } });
        if (!payerAccount) throw { statusCode: 404, message: 'Payer account not found' };

        if (Number(payerAccount.current_balance) < repaymentAmount) {
            throw { statusCode: 400, message: 'Insufficient funds' };
        }

        // 3. Deduct from Payer
        await tx.account.update({
            where: { id: payerAccount.id },
            data: {
                current_balance: { decrement: repaymentAmount },
                total_debt_obligation: { decrement: repaymentAmount }
            }
        });

        // 4. Update Obligation
        const newBalance = Number(obligation.remaining_balance) - repaymentAmount;
        const newStatus = newBalance <= 0 ? 'paid' : 'active';
        const paidAt = newBalance <= 0 ? new Date() : null;

        await tx.debtObligation.update({
            where: { id: obligation_id },
            data: {
                remaining_balance: newBalance,
                status: newStatus,
                paid_off_at: paidAt
            }
        });

        // 5. Credit Lender (if applicable)
        // If the debt was transferred, the "lender" is the one who *gave* the money originally?
        // Wait, in DTP:
        // Original Creditor (Bank) -> Original Borrower (User A)
        // User A transfers debt to User B.
        // Now User B owes Original Creditor.
        // So User B pays Original Creditor.
        // If Original Creditor is a CreditProvider (external), we might just record it.
        // If Original Creditor is a User (P2P loan?), we credit them.
        // The schema has `original_creditor_id` pointing to `CreditProvider`.
        // So we are paying back the Provider.
        // We assume we just deduct from user and mark as paid. The system "collects" the money for the provider.
        // We don't need to credit a user account unless it was a P2P loan which schema doesn't seem to fully support yet (provider is CreditProvider).
        // Let's assume we just deduct.

        // 6. Create Transaction
        const reference = `TXN-${Date.now()}-PAY${Math.floor(Math.random() * 1000)}`;
        const transaction = await tx.transaction.create({
            data: {
                reference_number: reference,
                sender_id: userId,
                sender_account_id: payerAccount.id,
                type: 'debt_payment',
                amount: repaymentAmount,
                status: 'completed',
                description: `Repayment for obligation ${obligation.obligation_number}`,
                metadata: {
                    obligation_id: obligation.id,
                    new_balance: newBalance
                }
            }
        });

        return {
            transaction_id: transaction.id,
            reference_number: transaction.reference_number,
            amount: repaymentAmount,
            remaining_debt: newBalance,
            status: newStatus,
            message: 'Repayment successful'
        };
    });

    // Send Notification
    await createNotification(
        userId,
        'payment_due', // or 'payment_success'
        'Debt Repayment Successful',
        `You successfully paid ${amount} towards your debt.`,
        `/debt/obligations/${obligation_id}`
    );

    return result;
};
