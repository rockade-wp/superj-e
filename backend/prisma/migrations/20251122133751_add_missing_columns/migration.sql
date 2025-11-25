/*
  Warnings:

  - Added the required column `activity` to the `SpjSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SpjForm" ADD COLUMN     "physicalSignatureFileType" TEXT;

-- AlterTable
ALTER TABLE "SpjSubmission" ADD COLUMN     "activity" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VerificationSheet" ADD COLUMN     "finalNotes" TEXT;
