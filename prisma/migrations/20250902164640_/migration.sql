-- CreateTable
CREATE TABLE "public"."gig_workers" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "aadharNo" TEXT,
    "panNo" TEXT,
    "uanNumber" TEXT,
    "votersId" TEXT,
    "educationCertificate" TEXT,
    "skills" TEXT[],
    "homeGeoLocation" TEXT,
    "workGeoLocation" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "platform" TEXT,
    "serviceType" TEXT,
    "workerId" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "totalJobs" INTEGER DEFAULT 0,
    "verificationLevel" TEXT NOT NULL DEFAULT 'basic',
    "backgroundCheckStatus" TEXT NOT NULL DEFAULT 'pending',
    "licenseNumber" TEXT,
    "vehicleType" TEXT,
    "profileId" TEXT,
    "address" TEXT,
    "credentialId" TEXT,
    "registryId" TEXT,
    "mnemonic" TEXT,
    "publicKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batchId" TEXT,

    CONSTRAINT "gig_workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."registries" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registryId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "schema" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "registries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."batch_uploads" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filename" TEXT NOT NULL,
    "totalRecords" INTEGER NOT NULL,
    "processedRecords" INTEGER NOT NULL DEFAULT 0,
    "failedRecords" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "errors" TEXT,

    CONSTRAINT "batch_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gig_workers_email_key" ON "public"."gig_workers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "gig_workers_phoneNumber_key" ON "public"."gig_workers"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "gig_workers_aadharNo_key" ON "public"."gig_workers"("aadharNo");

-- CreateIndex
CREATE UNIQUE INDEX "gig_workers_panNo_key" ON "public"."gig_workers"("panNo");

-- CreateIndex
CREATE UNIQUE INDEX "gig_workers_uanNumber_key" ON "public"."gig_workers"("uanNumber");

-- CreateIndex
CREATE UNIQUE INDEX "gig_workers_votersId_key" ON "public"."gig_workers"("votersId");

-- CreateIndex
CREATE UNIQUE INDEX "gig_workers_workerId_key" ON "public"."gig_workers"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "gig_workers_profileId_key" ON "public"."gig_workers"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "gig_workers_address_key" ON "public"."gig_workers"("address");

-- CreateIndex
CREATE UNIQUE INDEX "gig_workers_credentialId_key" ON "public"."gig_workers"("credentialId");

-- CreateIndex
CREATE UNIQUE INDEX "registries_registryId_key" ON "public"."registries"("registryId");

-- CreateIndex
CREATE UNIQUE INDEX "registries_address_key" ON "public"."registries"("address");
