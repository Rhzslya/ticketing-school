/*
  Warnings:

  - You are about to alter the column `title` on the `Ticket` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "attachment" TEXT,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(100);
