/*
  Warnings:

  - The `attachment_url` column on the `Ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "attachment_url",
ADD COLUMN     "attachment_url" TEXT[] DEFAULT ARRAY[]::TEXT[];
