-- AlterTable
ALTER TABLE `User` ADD COLUMN `address` VARCHAR(255) NULL,
    ADD COLUMN `city` VARCHAR(100) NULL,
    ADD COLUMN `country` VARCHAR(100) NULL,
    ADD COLUMN `date_of_birth` DATE NULL,
    ADD COLUMN `occupation` VARCHAR(100) NULL,
    ADD COLUMN `postal_code` VARCHAR(20) NULL,
    ADD COLUMN `state` VARCHAR(100) NULL;
