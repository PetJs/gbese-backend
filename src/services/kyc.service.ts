import prisma from '../config/db.js';

export const submitKycInfo = async (userId: string, data: any) => {
    const { address, city, state, country, postal_code, date_of_birth, occupation } = data;

    // Update user profile with KYC data
    await prisma.user.update({
        where: { id: userId },
        data: {
            address,
            city,
            state,
            country,
            postal_code,
            date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
            occupation,
            kyc_status: 'pending' // Ensure status is pending until docs are verified
        }
    });

    return {
        kyc_status: 'pending',
        submission_id: userId,
        next_step: 'document_upload',
        message: 'Personal information saved successfully'
    };
};

export const uploadKycDocument = async (userId: string, file: any, documentType: string) => {
    // Handle file upload (mocking S3 upload)
    const fileUrl = `https://s3.amazonaws.com/gbese-kyc/${userId}/${file.originalname}`;

    // Auto-verify for testing purposes
    await prisma.user.update({
        where: { id: userId },
        data: { kyc_status: 'verified' }
    });

    const doc = await prisma.kYCDocument.create({
        data: {
            user_id: userId,
            document_type: documentType as any,
            file_url: fileUrl,
            file_hash: 'mock_hash_sha256', // In real app, calculate hash
            file_size_bytes: file.size,
            mime_type: file.mimetype,
            review_status: 'approved', // Auto-approve
        }
    });

    return {
        document_id: doc.id,
        document_type: doc.document_type,
        file_url: doc.file_url,
        review_status: doc.review_status,
        uploaded_at: doc.uploaded_at,
        message: 'Document verified. Account status updated to Verified.'
    };
};
