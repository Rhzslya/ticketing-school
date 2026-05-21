/*
  Warnings:

  - You are about to drop the column `is_verified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `token_expired_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verify_expires_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verify_token` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_verify_token_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "is_verified",
DROP COLUMN "token",
DROP COLUMN "token_expired_at",
DROP COLUMN "verify_expires_at",
DROP COLUMN "verify_token";
