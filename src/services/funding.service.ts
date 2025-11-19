import prisma from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const initiateDeposit = async (userId: string, data: any) => {
    const { amount, payment_method, metadata } = data;

    // In a real app, we would integrate with a payment gateway here (e.g., Paystack, Flutterwave)
    // For this implementation, we will simulate a pending deposit transaction.

    const reference = `TXN-${Date.now()}-DEP${Math.floor(Math.random() * 1000)}`;

    // Fetch user account first
    const account = await prisma.account.findUnique({ where: { user_id: userId } });
    if (!account) {
        throw { statusCode: 404, message: 'Account not found' };
    }

    const transaction = await prisma.transaction.create({
        data: {
            reference_number: reference,
            recipient_id: userId,
            recipient_account_id: account.id,
            type: 'deposit',
            amount: amount,
            status: 'pending',
            metadata: {
                payment_method,
                ...metadata
            }
        }
    });

    return {
        transaction_id: transaction.id,
        reference_number: transaction.reference_number,
        amount: transaction.amount,
        payment_method,
        payment_instructions: {
            bank_name: 'Wema Bank',
            account_number: '1234567890',
            account_name: 'GBESE - User',
            expires_at: new Date(Date.now() + 3600000) // 1 hour
        },
        status: transaction.status
    };
};

export const initiateWithdrawal = async (userId: string, data: any) => {
    const { amount, bank_code, account_number, narration } = data;
    const fee = 50.00;
    const totalDeduction = Number(amount) + fee;

    // Use transaction to ensure atomicity
    return await prisma.$transaction(async (tx: any) => {
        const account = await tx.account.findUnique({ where: { user_id: userId } });

        if (!account) throw { statusCode: 404, message: 'Account not found' };

        const availableBalance = Number(account.current_balance); // Simplify for now, ignoring credit limit for withdrawal
        // Logic: Can only withdraw own funds? Or credit too? Usually own funds.
        // Prompt says "Amount must be <= available balance".
        // Let's assume available_credit is what matters if we allow credit withdrawal, but usually withdrawal is cash.
        // Let's check against current_balance for safety or available_credit if it includes credit line.
        // "available_credit" in schema includes credit limit.
        // Let's use available_credit logic.

        const availableCredit = Number(account.credit_limit) - Number(account.total_debt_obligation) - Number(account.pending_transfers_out) + Number(account.current_balance);
        // Wait, available_credit formula in schema was: credit_limit - total_debt_obligation - pending_transfers_out.
        // That formula seems to imply "credit available to borrow".
        // If I have cash, it should be current_balance + available_credit?
        // Let's assume `current_balance` is the actual money I have. `credit_limit` is what I can borrow.
        // So total purchasing power = current_balance + (credit_limit - debt).
        // For withdrawal, usually you can only withdraw positive balance, not credit (unless cash advance).
        // Let's stick to `current_balance` for withdrawal to be safe/standard.

        if (availableBalance < totalDeduction) {
            throw { statusCode: 400, message: 'Insufficient funds' };
        }

        // Deduct from balance (or reserve it)
        // In this system, we might move it to pending_transfers_out?
        // Let's update pending_transfers_out
        await tx.account.update({
            where: { id: account.id },
            data: {
                pending_transfers_out: { increment: totalDeduction }
            }
        });

        const reference = `TXN-${Date.now()}-WTH${Math.floor(Math.random() * 1000)}`;

        const transaction = await tx.transaction.create({
            data: {
                reference_number: reference,
                sender_id: userId,
                sender_account_id: account.id,
                type: 'withdrawal',
                amount: amount,
                fee: fee,
                status: 'processing',
                description: narration || 'Withdrawal',
                metadata: {
                    bank_code,
                    account_number,
                    bank_name: 'Zenith Bank' // Mock
                }
            }
        });

        return {
            transaction_id: transaction.id,
            reference_number: transaction.reference_number,
            amount: transaction.amount,
            fee: transaction.fee,
            net_amount: Number(amount),
            bank_name: 'Zenith Bank',
            account_number,
            status: transaction.status,
            estimated_completion: new Date(Date.now() + 300000) // 5 mins
        };
    });
};
