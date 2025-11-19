import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export const registerUser = async (data: any) => {
    const { email, password, first_name, last_name, phone_number } = data;

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { phone_number }]
        }
    });

    if (existingUser) {
        throw { statusCode: 400, message: 'User with this email or phone already exists' };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Use a transaction to create user and account
    const result = await prisma.$transaction(async (tx: any) => {
        const user = await tx.user.create({
            data: {
                email,
                password_hash: passwordHash,
                first_name,
                last_name,
                phone_number,
            }
        });

        // Generate account number (GBESE-TIMESTAMP-RANDOM)
        const accountNumber = `GBESE-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10000)}`;

        await tx.account.create({
            data: {
                user_id: user.id,
                account_number: accountNumber,
                currency: 'NGN',
                account_type: 'standard'
            }
        });

        return user;
    });

    return {
        user_id: result.id,
        email: result.email,
        verification_required: true,
        verification_methods: ['email', 'sms']
    };
};

export const loginUser = async (data: any) => {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        // Increment failed attempts logic here if needed
        throw { statusCode: 401, message: 'Invalid credentials' };
    }

    if (user.account_status !== 'active') {
        throw { statusCode: 403, message: `Account is ${user.account_status}` };
    }

    const token = jwt.sign(
        { user_id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        { user_id: user.id },
        process.env.JWT_SECRET as string, // In prod, use separate secret
        { expiresIn: '7d' }
    );

    await prisma.user.update({
        where: { id: user.id },
        data: { last_login: new Date() }
    });

    return {
        access_token: token,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
            id: user.id,
            email: user.email,
            full_name: `${user.first_name} ${user.last_name}`,
            kyc_status: user.kyc_status,
            two_factor_required: user.two_factor_enabled
        }
    };
};
