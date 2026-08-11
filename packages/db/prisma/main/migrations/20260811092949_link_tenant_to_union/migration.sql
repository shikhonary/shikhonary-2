/*
  Warnings:

  - You are about to drop the column `address` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `districtName` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `divisionName` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `unionName` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `upazilaName` on the `tenant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tenant" DROP COLUMN "address",
DROP COLUMN "districtName",
DROP COLUMN "divisionName",
DROP COLUMN "unionName",
DROP COLUMN "upazilaName",
ADD COLUMN     "chairmanSignature" TEXT,
ADD COLUMN     "districtId" TEXT,
ADD COLUMN     "divisionId" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "secretarySignature" TEXT,
ADD COLUMN     "unionId" TEXT,
ADD COLUMN     "upazilaId" TEXT;

-- CreateIndex
CREATE INDEX "tenant_divisionId_idx" ON "tenant"("divisionId");

-- CreateIndex
CREATE INDEX "tenant_districtId_idx" ON "tenant"("districtId");

-- CreateIndex
CREATE INDEX "tenant_upazilaId_idx" ON "tenant"("upazilaId");

-- CreateIndex
CREATE INDEX "tenant_unionId_idx" ON "tenant"("unionId");

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "district"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_upazilaId_fkey" FOREIGN KEY ("upazilaId") REFERENCES "upazila"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_unionId_fkey" FOREIGN KEY ("unionId") REFERENCES "union"("id") ON DELETE SET NULL ON UPDATE CASCADE;
