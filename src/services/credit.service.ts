import prisma from '../config/db.js';

export const getCreditProviders = async () => {
    return await prisma.creditProvider.findMany({
        where: { is_active: true },
        select: {
            id: true,
            name: true,
            default_interest_rate: true,
            min_loan_amount: true,
            max_loan_amount: true,
            max_tenure_months: true,
            endpoint_url: true // using endpoint_url as terms_url placeholder or just omitting
        }
    });
};

export const getCreditRates = async () => {
    const providers = await prisma.creditProvider.findMany({
        where: { is_active: true },
        select: {
            id: true,
            name: true,
            default_interest_rate: true
        }
    });

    return providers.map((p: any) => ({
        provider_id: p.id,
        provider_name: p.name,
        base_rate: p.default_interest_rate,
        risk_adjusted_rate: p.default_interest_rate
    }));
};

export const applyForCredit = async (userId: string, data: any) => {
    const { provider_id, amount, tenure_months, purpose } = data;

    const provider = await prisma.creditProvider.findUnique({
        where: { id: provider_id }
    });

    if (!provider) {
        throw { statusCode: 404, message: 'Credit provider not found' };
    }

    if (amount < Number(provider.min_loan_amount) || amount > Number(provider.max_loan_amount)) {
        throw { statusCode: 400, message: `Amount must be between ${provider.min_loan_amount} and ${provider.max_loan_amount}` };
    }

    if (tenure_months > provider.max_tenure_months) {
        throw { statusCode: 400, message: `Tenure cannot exceed ${provider.max_tenure_months} months` };
    }

    const interestRate = Number(provider.default_interest_rate);
    const interestAmount = (amount * interestRate * tenure_months) / 1200; // Monthly interest assumption
    const totalRepayment = amount + interestAmount;

    const applicationNumber = `CAP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const application = await prisma.creditApplication.create({
        data: {
            application_number: applicationNumber,
            user_id: userId,
            provider_id: provider_id,
            requested_amount: amount,
            interest_rate: interestRate,
            tenure_months: tenure_months,
            status: 'submitted' as any,
            application_data: {
                purpose,
                calculated_interest: interestAmount,
                total_repayment: totalRepayment
            }
        }
    });

    // Auto-approve and disburse
    await disburseCredit(application.id);

    // Refetch to get updated status
    const updatedApplication = await prisma.creditApplication.findUnique({
        where: { id: application.id }
    });

    return {
        application_id: updatedApplication?.id,
        application_number: updatedApplication?.application_number,
        status: updatedApplication?.status,
        amount: updatedApplication?.requested_amount,
        interest_rate: updatedApplication?.interest_rate,
        total_repayment: totalRepayment,
        submitted_at: updatedApplication?.submitted_at,
        disbursed_at: updatedApplication?.disbursed_at
    };
};

const disburseCredit = async (applicationId: string) => {
    const application = await prisma.creditApplication.findUnique({
        where: { id: applicationId },
        include: { provider: true }
    });

    if (!application) throw { statusCode: 404, message: 'Application not found' };
    if (application.status !== 'submitted') return; // Already processed

    const account = await prisma.account.findUnique({
        where: { user_id: application.user_id }
    });

    if (!account) throw { statusCode: 404, message: 'User account not found' };

    const amount = Number(application.requested_amount);
    const interestRate = Number(application.interest_rate);
    const tenureMonths = application.tenure_months;

    // Calculate repayment details
    const interestAmount = (amount * interestRate * tenureMonths) / 1200;
    const totalRepayment = amount + interestAmount;
    const monthlyPayment = totalRepayment / tenureMonths;

    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setMonth(dueDate.getMonth() + tenureMonths);

    const nextPaymentDate = new Date(now);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    await prisma.$transaction([
        // 1. Update Application Status
        prisma.creditApplication.update({
            where: { id: applicationId },
            data: {
                status: 'disbursed',
                approved_amount: amount,
                monthly_payment: monthlyPayment,
                approved_at: now,
                disbursed_at: now,
                decision_data: {
                    auto_approved: true,
                    reason: 'Meets criteria'
                }
            }
        }),

        // 2. Credit User Account
        prisma.account.update({
            where: { id: account.id },
            data: {
                current_balance: { increment: amount },
                total_debt_obligation: { increment: totalRepayment }
            }
        }),

        // 3. Create Transaction Record
        prisma.transaction.create({
            data: {
                reference_number: `TX-LOAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                recipient_id: application.user_id,
                recipient_account_id: account.id,
                type: 'loan_disbursement',
                amount: amount,
                status: 'completed',
                description: `Loan disbursement from ${application.provider.name}`,
                completed_at: now,
                metadata: {
                    application_id: applicationId,
                    provider_id: application.provider_id
                }
            }
        }),

        // 4. Create Debt Obligation
        prisma.debtObligation.create({
            data: {
                obligation_number: `DOB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                current_holder_id: application.user_id,
                original_creditor_id: application.provider_id,
                original_borrower_id: application.user_id,
                principal_amount: amount,
                remaining_balance: totalRepayment,
                interest_rate: interestRate,
                monthly_payment: monthlyPayment,
                due_date: dueDate,
                next_payment_date: nextPaymentDate,
                status: 'active'
            }
        })
    ]);
};

export const getApplicationStatus = async (userId: string, applicationId: string) => {
    const application = await prisma.creditApplication.findUnique({
        where: { id: applicationId },
        include: { provider: { select: { name: true } } }
    });

    if (!application) {
        throw { statusCode: 404, message: 'Application not found' };
    }

    if (application.user_id !== userId) {
        throw { statusCode: 403, message: 'Unauthorized' };
    }

    return {
        id: application.id,
        application_number: application.application_number,
        provider: application.provider.name,
        amount: application.requested_amount,
        status: application.status,
        submitted_at: application.submitted_at,
        reviewed_at: application.reviewed_at
    };
};

export const getUserReputation = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { reputation_score: true }
    });

    if (!user) {
        throw { statusCode: 404, message: 'User not found' };
    }

    const score = Number(user.reputation_score);
    let tier = 'Bronze';

    if (score >= 700) tier = 'Gold';
    else if (score >= 500) tier = 'Silver';

    return {
        score: score,
        tier: tier
    };
};
