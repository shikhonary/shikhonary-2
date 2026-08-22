/*
  Warnings:

  - You are about to drop the column `customCitizenLimit` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `canCollectHoldingTax` on the `subscription_plan` table. All the data in the column will be lost.
  - You are about to drop the column `canManageTradeLicense` on the `subscription_plan` table. All the data in the column will be lost.
  - You are about to drop the column `defaultCitizenLimit` on the `subscription_plan` table. All the data in the column will be lost.
  - You are about to drop the column `chairmanName` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `chairmanSignature` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `citizenCount` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `customCitizenLimit` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `secretaryName` on the `tenant` table. All the data in the column will be lost.
  - You are about to drop the column `secretarySignature` on the `tenant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "customCitizenLimit",
ADD COLUMN     "customStudentLimit" INTEGER;

-- AlterTable
ALTER TABLE "subscription_plan" DROP COLUMN "canCollectHoldingTax",
DROP COLUMN "canManageTradeLicense",
DROP COLUMN "defaultCitizenLimit",
ADD COLUMN     "canCollectOnlineFees" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canManageAttendance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canManageLibrary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canManageTransport" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canUseLms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "defaultStudentLimit" INTEGER NOT NULL DEFAULT 1000;

-- AlterTable
ALTER TABLE "tenant" DROP COLUMN "chairmanName",
DROP COLUMN "chairmanSignature",
DROP COLUMN "citizenCount",
DROP COLUMN "customCitizenLimit",
DROP COLUMN "secretaryName",
DROP COLUMN "secretarySignature",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "board" TEXT,
ADD COLUMN     "customStudentLimit" INTEGER,
ADD COLUMN     "eiin" TEXT,
ADD COLUMN     "principalName" TEXT,
ADD COLUMN     "principalSignature" TEXT,
ADD COLUMN     "studentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vicePrincipalName" TEXT,
ADD COLUMN     "vicePrincipalSignature" TEXT,
ALTER COLUMN "type" SET DEFAULT 'SCHOOL';
