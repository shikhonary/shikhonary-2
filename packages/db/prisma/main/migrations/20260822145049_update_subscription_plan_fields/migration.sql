/*
  Warnings:

  - You are about to drop the column `customCertificateLimit` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `customStaffLimit` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `canCollectOnlineFees` on the `subscription_plan` table. All the data in the column will be lost.
  - You are about to drop the column `canIssueCertificates` on the `subscription_plan` table. All the data in the column will be lost.
  - You are about to drop the column `defaultCertificateLimit` on the `subscription_plan` table. All the data in the column will be lost.
  - You are about to drop the column `defaultStaffLimit` on the `subscription_plan` table. All the data in the column will be lost.
  - You are about to drop the column `certificateCount` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `customCertificateLimit` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `customStaffLimit` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `facebookUrl` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `geoCode` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `staffCount` on the `tenant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "customCertificateLimit",
DROP COLUMN "customStaffLimit",
ADD COLUMN     "customExamLimit" INTEGER,
ADD COLUMN     "customTeacherLimit" INTEGER;

-- AlterTable
ALTER TABLE "subscription_plan" DROP COLUMN "canCollectOnlineFees",
DROP COLUMN "canIssueCertificates",
DROP COLUMN "defaultCertificateLimit",
DROP COLUMN "defaultStaffLimit",
ADD COLUMN     "canCollectFees" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canCreateExams" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canExportReports" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canUseAiFeatures" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "defaultCreditLimit" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "defaultExamLimit" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN     "defaultTeacherLimit" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "tenant" DROP COLUMN "certificateCount",
DROP COLUMN "customCertificateLimit",
DROP COLUMN "customStaffLimit",
DROP COLUMN "facebookUrl",
DROP COLUMN "geoCode",
DROP COLUMN "staffCount",
ADD COLUMN     "creditBalance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "curriculum" TEXT,
ADD COLUMN     "customExamLimit" INTEGER,
ADD COLUMN     "customTeacherLimit" INTEGER,
ADD COLUMN     "establishedYear" INTEGER,
ADD COLUMN     "examCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "medium" TEXT,
ADD COLUMN     "shift" TEXT,
ADD COLUMN     "socialLinks" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "teacherCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalCreditsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "credit_transaction" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credit_transaction_tenantId_idx" ON "credit_transaction"("tenantId");

-- CreateIndex
CREATE INDEX "credit_transaction_type_idx" ON "credit_transaction"("type");

-- CreateIndex
CREATE INDEX "credit_transaction_createdAt_idx" ON "credit_transaction"("createdAt");

-- AddForeignKey
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
