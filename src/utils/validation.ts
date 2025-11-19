import Joi from 'joi';

export const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        }),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    phone_number: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required(), // E.164 format
    referral_code: Joi.string().optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    device_fingerprint: Joi.string().optional(),
});

export const updateProfileSchema = Joi.object({
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    phone_number: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).optional(),
});

export const createPinSchema = Joi.object({
    pin: Joi.string().length(4).pattern(/^[0-9]+$/).required(),
    confirm_pin: Joi.string().valid(Joi.ref('pin')).required(),
    password: Joi.string().required(),
});

export const changePinSchema = Joi.object({
    current_pin: Joi.string().length(4).pattern(/^[0-9]+$/).required(),
    new_pin: Joi.string().length(4).pattern(/^[0-9]+$/).required(),
    confirm_pin: Joi.string().valid(Joi.ref('new_pin')).required(),
});

export const verify2FASchema = Joi.object({
    code: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
});

export const kycSubmitSchema = Joi.object({
    date_of_birth: Joi.date().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        postal_code: Joi.string().required(),
    }).required(),
    occupation: Joi.string().required(),
    bvn: Joi.string().length(11).pattern(/^[0-9]+$/).optional(),
    nin: Joi.string().length(11).pattern(/^[0-9]+$/).optional(),
});

export const depositSchema = Joi.object({
    amount: Joi.number().positive().required(),
    payment_method: Joi.string().valid('bank_transfer', 'card', 'ussd').required(),
    currency: Joi.string().valid('NGN').default('NGN'),
    metadata: Joi.object().optional(),
});

export const withdrawalSchema = Joi.object({
    amount: Joi.number().positive().required(),
    bank_code: Joi.string().required(),
    account_number: Joi.string().required(),
    narration: Joi.string().optional(),
});

export const transferSchema = Joi.object({
    recipient: Joi.string().required(), // Account number, email, or phone
    amount: Joi.number().positive().required(),
    description: Joi.string().optional(),
    metadata: Joi.object().optional(),
});

export const creditApplicationSchema = Joi.object({
    provider_id: Joi.string().required(),
    amount: Joi.number().positive().required(),
    duration_days: Joi.number().integer().min(1).required(),
    purpose: Joi.string().optional(),
});

export const paymentScheduleSchema = Joi.object({
    obligation_id: Joi.string().required(),
    payment_date: Joi.date().greater('now').required(),
    amount: Joi.number().positive().required(),
});

export const debtTransferSchema = Joi.object({
    obligation_id: Joi.string().required(),
    new_lender_id: Joi.string().required(), // User ID of the new lender
    discount_rate: Joi.number().min(0).max(100).optional(),
    reason: Joi.string().optional(),
});
