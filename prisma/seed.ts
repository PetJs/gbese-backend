import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create Credit Providers
    const providers = [
        {
            name: 'QuickCredit',
            slug: 'quick-credit',
            api_key_hash: 'hash_123', // In a real app, this would be a hashed key
            webhook_secret: 'secret_123',
            endpoint_url: 'https://api.quickcredit.com/v1',
            default_interest_rate: 5.5,
            min_loan_amount: 1000,
            max_loan_amount: 500000,
            min_tenure_months: 1,
            max_tenure_months: 12,
            is_active: true,
            logo_url: 'https://example.com/logos/quickcredit.png'
        },
        {
            name: 'NanoLend',
            slug: 'nano-lend',
            api_key_hash: 'hash_456',
            webhook_secret: 'secret_456',
            endpoint_url: 'https://api.nanolend.io/v1',
            default_interest_rate: 7.2,
            min_loan_amount: 500,
            max_loan_amount: 100000,
            min_tenure_months: 1,
            max_tenure_months: 6,
            is_active: true,
            logo_url: 'https://example.com/logos/nanolend.png'
        }
    ];

    for (const provider of providers) {
        const exists = await prisma.creditProvider.findUnique({
            where: { slug: provider.slug }
        });

        if (!exists) {
            await prisma.creditProvider.create({
                data: provider
            });
            console.log(`Created provider: ${provider.name}`);
        } else {
            console.log(`Provider already exists: ${provider.name}`);
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
