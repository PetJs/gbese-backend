import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export const getUserProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            phone_number: true,
            kyc_status: true,
            reputation_score: true,
            account_status: true,
            two_factor_enabled: true,
            created_at: true,
            last_login: true,
            address: true,
            city: true,
            state: true,
            country: true,
            postal_code: true,
            date_of_birth: true,
            occupation: true,
        },
    });

    if (!user) {
        throw { statusCode: 404, message: 'User not found' };
    }

    return user;
};

export const updateUserProfile = async (userId: string, data: any) => {
    const { first_name, last_name, phone_number } = data;

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            first_name,
            last_name,
            phone_number,
        },
        select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            phone_number: true,
            updated_at: true,
        },
    });

    return user;
};

export const createTransactionPin = async (userId: string, data: any) => {
    const { pin, confirm_pin, password } = data;

    if (pin !== confirm_pin) {
        throw { statusCode: 400, message: 'PINs do not match' };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { statusCode: 404, message: 'User not found' };

    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
        throw { statusCode: 401, message: 'Invalid password' };
    }

    if (user.transaction_pin_hash) {
        throw { statusCode: 400, message: 'PIN already created. Use change PIN endpoint.' };
    }

    const pinHash = await bcrypt.hash(pin, 10);

    await prisma.user.update({
        where: { id: userId },
        data: { transaction_pin_hash: pinHash },
    });

    return { message: 'Transaction PIN created successfully' };
};

export const changeTransactionPin = async (userId: string, data: any) => {
    const { current_pin, new_pin, confirm_pin } = data;

    if (new_pin !== confirm_pin) {
        throw { statusCode: 400, message: 'New PINs do not match' };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { statusCode: 404, message: 'User not found' };

    if (!user.transaction_pin_hash) {
        throw { statusCode: 400, message: 'PIN not set. Use create PIN endpoint.' };
    }

    const isPinMatch = await bcrypt.compare(current_pin, user.transaction_pin_hash);
    if (!isPinMatch) {
        throw { statusCode: 401, message: 'Invalid current PIN' };
    }

    const newPinHash = await bcrypt.hash(new_pin, 10);

    await prisma.user.update({
        where: { id: userId },
        data: { transaction_pin_hash: newPinHash },
    });

    return { message: 'Transaction PIN updated successfully' };
};

export const enable2FA = async (userId: string) => {
    const secret = speakeasy.generateSecret({ length: 20 });

    await prisma.user.update({
        where: { id: userId },
        data: { two_factor_secret: secret.base32 },
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url as string);

    return {
        qr_code: qrCodeUrl,
        secret: secret.base32,
        backup_codes: ['12345678', '87654321'], // In real app, generate random codes
    };
};

export const verify2FA = async (userId: string, code: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.two_factor_secret) {
        throw { statusCode: 400, message: '2FA not initialized' };
    }

    const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: code,
    });

    if (!verified) {
        throw { statusCode: 400, message: 'Invalid 2FA code' };
    }

    await prisma.user.update({
        where: { id: userId },
        data: { two_factor_enabled: true },
    });

    return { message: 'Two-factor authentication enabled successfully' };
};
