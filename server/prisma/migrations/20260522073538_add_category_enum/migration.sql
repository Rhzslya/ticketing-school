-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('NETWORK', 'HARDWARE', 'SOFTWARE', 'ELECTRICAL', 'FACILITIES', 'OTHERS');

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "category" "TicketCategory" NOT NULL DEFAULT 'OTHERS';
