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

    return {
        application_id: application.id,
        application_number: application.application_number,
        status: application.status,
        amount: application.requested_amount,
        interest_rate: application.interest_rate,
        total_repayment: totalRepayment,
        submitted_at: application.submitted_at
    };
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
