-- CreateTable
CREATE TABLE "SpjSubmission" (
    "id" TEXT NOT NULL,
    "rupId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "activityName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "operatorId" TEXT NOT NULL,

    CONSTRAINT "SpjSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpjForm" (
    "id" TEXT NOT NULL,
    "spjId" TEXT NOT NULL,
    "formType" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "physicalSignatureScanUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'filled',
    "notes" TEXT,

    CONSTRAINT "SpjForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignatureLog" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "signerId" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tteMetadata" TEXT,

    CONSTRAINT "SignatureLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationSheet" (
    "id" TEXT NOT NULL,
    "spjId" TEXT NOT NULL,
    "validatorId" TEXT,
    "verifierId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "signedAt" TIMESTAMP(3),

    CONSTRAINT "VerificationSheet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationSheet_spjId_key" ON "VerificationSheet"("spjId");

-- AddForeignKey
ALTER TABLE "SpjSubmission" ADD CONSTRAINT "SpjSubmission_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpjForm" ADD CONSTRAINT "SpjForm_spjId_fkey" FOREIGN KEY ("spjId") REFERENCES "SpjSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureLog" ADD CONSTRAINT "SignatureLog_formId_fkey" FOREIGN KEY ("formId") REFERENCES "SpjForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignatureLog" ADD CONSTRAINT "SignatureLog_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationSheet" ADD CONSTRAINT "VerificationSheet_spjId_fkey" FOREIGN KEY ("spjId") REFERENCES "SpjSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationSheet" ADD CONSTRAINT "VerificationSheet_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationSheet" ADD CONSTRAINT "VerificationSheet_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
