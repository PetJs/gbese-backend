import prisma from '../config/db.js';

export const getDebtObligations = async (userId: string, query: any) => {
    const { status } = query;
    const where: any = { original_borrower_id: userId };

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
