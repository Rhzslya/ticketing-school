/*
  Warnings:

  - A unique constraint covering the columns `[verify_token]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "token" TEXT,
ADD COLUMN     "token_expired_at" TIMESTAMP(3),
ADD COLUMN     "verify_expires_at" TIMESTAMP(3),
ADD COLUMN     "verify_token" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "User_verify_token_key" ON "User"("verify_token");
