/*
  Warnings:

  - You are about to drop the column `aadharNo` on the `gig_workers` table. All the data in the column will be lost.
  - You are about to drop the column `panNo` on the `gig_workers` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `gig_workers` table. All the data in the column will be lost.
  - You are about to drop the column `totalJobs` on the `gig_workers` table. All the data in the column will be lost.
  - You are about to drop the column `uanNumber` on the `gig_workers` table. All the data in the column will be lost.
  - You are about to drop the column `votersId` on the `gig_workers` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ACTIVE', 'EXPIRED');

-- DropIndex
DROP INDEX "public"."gig_workers_aadharNo_key";

-- DropIndex
DROP INDEX "public"."gig_workers_panNo_key";

-- DropIndex
DROP INDEX "public"."gig_workers_uanNumber_key";

-- DropIndex
DROP INDEX "public"."gig_workers_votersId_key";

-- AlterTable
ALTER TABLE "public"."gig_workers" DROP COLUMN "aadharNo",
DROP COLUMN "panNo",
DROP COLUMN "rating",
DROP COLUMN "totalJobs",
DROP COLUMN "uanNumber",
DROP COLUMN "votersId";

-- CreateTable
CREATE TABLE "public"."VC" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "credId" TEXT NOT NULL,
    "vcName" TEXT NOT NULL,
    "vc" TEXT NOT NULL,
    "gigWorkerId" TEXT NOT NULL,

    CONSTRAINT "VC_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VC_vcName_key" ON "public"."VC"("vcName");

-- AddForeignKey
ALTER TABLE "public"."VC" ADD CONSTRAINT "VC_gigWorkerId_fkey" FOREIGN KEY ("gigWorkerId") REFERENCES "public"."gig_workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
