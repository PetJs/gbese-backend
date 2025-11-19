import prisma from '../config/db.js';

export const initiateTransfer = async (userId: string, data: any) => {
    const { recipient, amount, description, metadata } = data;

    // Find recipient user
    // Recipient can be account number, email, or phone
    const recipientUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: recipient },
                { phone_number: recipient },
                { account: { account_number: recipient } }
            ]
        },
        include: { account: true }
    });

    if (!recipientUser) {
        throw { statusCode: 404, message: 'Recipient not found' };
    }

    if (recipientUser.id === userId) {
        throw { statusCode: 400, message: 'Cannot transfer to yourself' };
    }

    const recipientAccount = recipientUser.account;
    if (!recipientAccount) {
        throw { statusCode: 404, message: 'Recipient account not found' };
    }

    return await prisma.$transaction(async (tx: any) => {
        const senderAccount = await tx.account.findUnique({ where: { user_id: userId } });

        if (!senderAccount) throw { statusCode: 404, message: 'Sender account not found' };

        const transferAmount = Number(amount);
        const currentBalance = Number(senderAccount.current_balance);

        // Check if balance is sufficient
        if (currentBalance < transferAmount) {
            throw { statusCode: 400, message: 'Insufficient funds' };
        }

        // Check daily limit
        const dailyLimit = Number(senderAccount.daily_transfer_limit);
        const dailyUsed = Number(senderAccount.daily_transfer_amount);

        if (dailyUsed + transferAmount > dailyLimit) {
            throw { statusCode: 400, message: 'Daily transfer limit exceeded' };
        }

        // Debit sender
        await tx.account.update({
            where: { id: senderAccount.id },
            data: {
                current_balance: { decrement: transferAmount },
                daily_transfer_amount: { increment: transferAmount }
            }
        });

        // Credit recipient
        await tx.account.update({
            where: { id: recipientAccount.id },
            data: {
                current_balance: { increment: transferAmount }
            }
        });

        // Create transaction record
        const reference = `TXN-${Date.now()}-TRF${Math.floor(Math.random() * 1000)}`;

        const transaction = await tx.transaction.create({
            data: {
                reference_number: reference,
                sender_id: userId,
                sender_account_id: senderAccount.id,
                recipient_id: recipientUser.id,
                recipient_account_id: recipientAccount.id,
                type: 'transfer',
                amount: transferAmount,
                status: 'completed',
                description: description || 'P2P Transfer',
                metadata: metadata
            }
        });

        return {
            transaction_id: transaction.id,
            reference_number: transaction.reference_number,
            amount: transaction.amount,
            sender: {
                name: 'You', // Or fetch name
                account_number: senderAccount.account_number
            },
            recipient: {
                name: `${recipientUser.first_name} ${recipientUser.last_name}`,
                account_number: recipientAccount.account_number
            },
            status: transaction.status,
            completed_at: transaction.completed_at
        };
    });
};
