/*
  Warnings:

  - You are about to drop the column `attachment` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "attachment",
ADD COLUMN     "attachment_url" TEXT;
