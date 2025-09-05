/*
  Warnings:

  - You are about to drop the column `credentialId` on the `gig_workers` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."Status" ADD VALUE 'PENDING';

-- DropIndex
DROP INDEX "public"."gig_workers_credentialId_key";

-- AlterTable
ALTER TABLE "public"."gig_workers" DROP COLUMN "credentialId";
