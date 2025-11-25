-- AlterTable
ALTER TABLE `Notification` MODIFY `type` ENUM('transfer', 'debt_request', 'payment_due', 'kyc_update', 'security_alert', 'credit_decision', 'system_announcement', 'system_alert') NOT NULL;
