-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `phone_number` VARCHAR(191) NOT NULL,
    `kyc_status` ENUM('pending', 'under_review', 'verified', 'rejected', 'expired') NOT NULL DEFAULT 'pending',
    `kyc_rejection_reason` TEXT NULL,
    `reputation_score` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `account_status` ENUM('active', 'suspended', 'closed', 'frozen') NOT NULL DEFAULT 'active',
    `role` ENUM('user', 'admin', 'compliance_officer', 'support') NOT NULL DEFAULT 'user',
    `two_factor_enabled` BOOLEAN NOT NULL DEFAULT false,
    `two_factor_secret` VARCHAR(191) NULL,
    `transaction_pin_hash` VARCHAR(191) NULL,
    `last_login` DATETIME(3) NULL,
    `failed_login_attempts` INTEGER NOT NULL DEFAULT 0,
    `locked_until` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_number_key`(`phone_number`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_phone_number_idx`(`phone_number`),
    INDEX `User_kyc_status_idx`(`kyc_status`),
    INDEX `User_account_status_idx`(`account_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `account_number` VARCHAR(191) NOT NULL,
    `current_balance` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `credit_limit` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `total_debt_obligation` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `pending_transfers_out` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `pending_transfers_in` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `available_credit` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'NGN',
    `account_type` ENUM('standard', 'premium', 'business') NOT NULL DEFAULT 'standard',
    `is_locked` BOOLEAN NOT NULL DEFAULT false,
    `daily_transfer_limit` DECIMAL(15, 2) NOT NULL DEFAULT 500000.00,
    `daily_transfer_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `last_limit_reset` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Account_user_id_key`(`user_id`),
    UNIQUE INDEX `Account_account_number_key`(`account_number`),
    INDEX `Account_user_id_idx`(`user_id`),
    INDEX `Account_account_number_idx`(`account_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` VARCHAR(191) NOT NULL,
    `reference_number` VARCHAR(191) NOT NULL,
    `idempotency_key` VARCHAR(191) NULL,
    `sender_id` VARCHAR(191) NULL,
    `recipient_id` VARCHAR(191) NULL,
    `sender_account_id` VARCHAR(191) NULL,
    `recipient_account_id` VARCHAR(191) NULL,
    `type` ENUM('transfer', 'deposit', 'withdrawal', 'bill_pay', 'loan_disbursement', 'debt_payment', 'debt_transfer_incentive') NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `fee` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `status` ENUM('pending', 'processing', 'completed', 'failed', 'reversed', 'cancelled') NOT NULL DEFAULT 'pending',
    `failure_reason` TEXT NULL,
    `description` VARCHAR(500) NULL,
    `metadata` JSON NULL,
    `initiated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,
    `reversed_at` DATETIME(3) NULL,
    `reversal_transaction_id` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Transaction_reference_number_key`(`reference_number`),
    UNIQUE INDEX `Transaction_idempotency_key_key`(`idempotency_key`),
    INDEX `Transaction_reference_number_idx`(`reference_number`),
    INDEX `Transaction_sender_id_idx`(`sender_id`),
    INDEX `Transaction_recipient_id_idx`(`recipient_id`),
    INDEX `Transaction_status_idx`(`status`),
    INDEX `Transaction_type_idx`(`type`),
    INDEX `Transaction_created_at_idx`(`created_at` DESC),
    INDEX `Transaction_idempotency_key_idx`(`idempotency_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DebtObligation` (
    `id` VARCHAR(191) NOT NULL,
    `obligation_number` VARCHAR(191) NOT NULL,
    `current_holder_id` VARCHAR(191) NOT NULL,
    `original_creditor_id` VARCHAR(191) NOT NULL,
    `original_borrower_id` VARCHAR(191) NOT NULL,
    `principal_amount` DECIMAL(15, 2) NOT NULL,
    `remaining_balance` DECIMAL(15, 2) NOT NULL,
    `interest_rate` DECIMAL(5, 2) NOT NULL,
    `monthly_payment` DECIMAL(15, 2) NOT NULL,
    `due_date` DATE NOT NULL,
    `next_payment_date` DATE NOT NULL,
    `status` ENUM('active', 'paid', 'defaulted', 'transferred', 'restructured') NOT NULL DEFAULT 'active',
    `is_transferable` BOOLEAN NOT NULL DEFAULT true,
    `transfer_count` INTEGER NOT NULL DEFAULT 0,
    `max_transfer_count` INTEGER NOT NULL DEFAULT 5,
    `days_overdue` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `transferred_at` DATETIME(3) NULL,
    `paid_off_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DebtObligation_obligation_number_key`(`obligation_number`),
    INDEX `DebtObligation_current_holder_id_idx`(`current_holder_id`),
    INDEX `DebtObligation_original_borrower_id_idx`(`original_borrower_id`),
    INDEX `DebtObligation_status_idx`(`status`),
    INDEX `DebtObligation_due_date_idx`(`due_date`),
    INDEX `DebtObligation_next_payment_date_idx`(`next_payment_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DebtTransferRequest` (
    `id` VARCHAR(191) NOT NULL,
    `request_number` VARCHAR(191) NOT NULL,
    `sender_id` VARCHAR(191) NOT NULL,
    `recipient_id` VARCHAR(191) NULL,
    `debt_id` VARCHAR(191) NOT NULL,
    `incentive_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `incentive_percentage` DECIMAL(5, 2) NULL,
    `transfer_type` ENUM('direct', 'anonymous_shuffle', 'marketplace') NOT NULL DEFAULT 'direct',
    `status` ENUM('pending', 'accepted', 'rejected', 'cancelled', 'expired') NOT NULL DEFAULT 'pending',
    `rejection_reason` TEXT NULL,
    `notes` TEXT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `accepted_at` DATETIME(3) NULL,
    `rejected_at` DATETIME(3) NULL,
    `cancelled_at` DATETIME(3) NULL,

    UNIQUE INDEX `DebtTransferRequest_request_number_key`(`request_number`),
    INDEX `DebtTransferRequest_sender_id_idx`(`sender_id`),
    INDEX `DebtTransferRequest_recipient_id_idx`(`recipient_id`),
    INDEX `DebtTransferRequest_debt_id_idx`(`debt_id`),
    INDEX `DebtTransferRequest_status_idx`(`status`),
    INDEX `DebtTransferRequest_created_at_idx`(`created_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditProvider` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `api_key_hash` VARCHAR(191) NOT NULL,
    `webhook_secret` VARCHAR(191) NOT NULL,
    `endpoint_url` VARCHAR(500) NOT NULL,
    `default_interest_rate` DECIMAL(5, 2) NOT NULL,
    `min_loan_amount` DECIMAL(15, 2) NOT NULL,
    `max_loan_amount` DECIMAL(15, 2) NOT NULL,
    `min_tenure_months` INTEGER NOT NULL,
    `max_tenure_months` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `logo_url` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CreditProvider_slug_key`(`slug`),
    INDEX `CreditProvider_slug_idx`(`slug`),
    INDEX `CreditProvider_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditApplication` (
    `id` VARCHAR(191) NOT NULL,
    `application_number` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `provider_id` VARCHAR(191) NOT NULL,
    `requested_amount` DECIMAL(15, 2) NOT NULL,
    `approved_amount` DECIMAL(15, 2) NULL,
    `tenure_months` INTEGER NOT NULL,
    `interest_rate` DECIMAL(5, 2) NOT NULL,
    `monthly_payment` DECIMAL(15, 2) NULL,
    `status` ENUM('submitted', 'under_review', 'approved', 'rejected', 'disbursed', 'cancelled') NOT NULL DEFAULT 'submitted',
    `rejection_reason` TEXT NULL,
    `external_reference` VARCHAR(191) NULL,
    `application_data` JSON NOT NULL,
    `decision_data` JSON NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewed_at` DATETIME(3) NULL,
    `approved_at` DATETIME(3) NULL,
    `disbursed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CreditApplication_application_number_key`(`application_number`),
    INDEX `CreditApplication_user_id_idx`(`user_id`),
    INDEX `CreditApplication_provider_id_idx`(`provider_id`),
    INDEX `CreditApplication_status_idx`(`status`),
    INDEX `CreditApplication_submitted_at_idx`(`submitted_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KYCDocument` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `document_type` ENUM('national_id', 'drivers_license', 'passport', 'utility_bill', 'bank_statement', 'selfie') NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `file_hash` VARCHAR(64) NOT NULL,
    `file_size_bytes` BIGINT NOT NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `review_status` ENUM('pending', 'under_review', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `rejection_reason` TEXT NULL,
    `reviewed_by` VARCHAR(191) NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewed_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,

    INDEX `KYCDocument_user_id_idx`(`user_id`),
    INDEX `KYCDocument_review_status_idx`(`review_status`),
    INDEX `KYCDocument_document_type_idx`(`document_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `admin_id` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `resource_type` VARCHAR(191) NOT NULL,
    `resource_id` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NOT NULL,
    `user_agent` VARCHAR(191) NULL,
    `request_id` VARCHAR(191) NULL,
    `changes` JSON NULL,
    `metadata` JSON NULL,
    `severity` ENUM('info', 'warning', 'error', 'critical') NOT NULL DEFAULT 'info',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_user_id_idx`(`user_id`),
    INDEX `AuditLog_admin_id_idx`(`admin_id`),
    INDEX `AuditLog_action_idx`(`action`),
    INDEX `AuditLog_created_at_idx`(`created_at` DESC),
    INDEX `AuditLog_resource_type_resource_id_idx`(`resource_type`, `resource_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` ENUM('transfer', 'debt_request', 'payment_due', 'kyc_update', 'security_alert', 'credit_decision', 'system_announcement') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `action_url` VARCHAR(500) NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `priority` ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
    `read_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_user_id_idx`(`user_id`),
    INDEX `Notification_is_read_idx`(`is_read`),
    INDEX `Notification_created_at_idx`(`created_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentSchedule` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `debt_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `frequency` ENUM('weekly', 'biweekly', 'monthly') NOT NULL,
    `next_execution_date` DATE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `auto_retry_on_failure` BOOLEAN NOT NULL DEFAULT true,
    `max_retry_attempts` INTEGER NOT NULL DEFAULT 3,
    `failed_attempts` INTEGER NOT NULL DEFAULT 0,
    `last_execution_at` DATETIME(3) NULL,
    `last_execution_status` ENUM('success', 'failed', 'skipped') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deactivated_at` DATETIME(3) NULL,

    INDEX `PaymentSchedule_user_id_idx`(`user_id`),
    INDEX `PaymentSchedule_debt_id_idx`(`debt_id`),
    INDEX `PaymentSchedule_next_execution_date_idx`(`next_execution_date`),
    INDEX `PaymentSchedule_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_sender_account_id_fkey` FOREIGN KEY (`sender_account_id`) REFERENCES `Account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_recipient_account_id_fkey` FOREIGN KEY (`recipient_account_id`) REFERENCES `Account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_reversal_transaction_id_fkey` FOREIGN KEY (`reversal_transaction_id`) REFERENCES `Transaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DebtObligation` ADD CONSTRAINT `DebtObligation_current_holder_id_fkey` FOREIGN KEY (`current_holder_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DebtObligation` ADD CONSTRAINT `DebtObligation_original_creditor_id_fkey` FOREIGN KEY (`original_creditor_id`) REFERENCES `CreditProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DebtObligation` ADD CONSTRAINT `DebtObligation_original_borrower_id_fkey` FOREIGN KEY (`original_borrower_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DebtTransferRequest` ADD CONSTRAINT `DebtTransferRequest_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DebtTransferRequest` ADD CONSTRAINT `DebtTransferRequest_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DebtTransferRequest` ADD CONSTRAINT `DebtTransferRequest_debt_id_fkey` FOREIGN KEY (`debt_id`) REFERENCES `DebtObligation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditApplication` ADD CONSTRAINT `CreditApplication_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditApplication` ADD CONSTRAINT `CreditApplication_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `CreditProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KYCDocument` ADD CONSTRAINT `KYCDocument_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KYCDocument` ADD CONSTRAINT `KYCDocument_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentSchedule` ADD CONSTRAINT `PaymentSchedule_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentSchedule` ADD CONSTRAINT `PaymentSchedule_debt_id_fkey` FOREIGN KEY (`debt_id`) REFERENCES `DebtObligation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
