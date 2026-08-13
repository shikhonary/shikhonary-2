/*
  Warnings:

  - You are about to drop the column `postCode` on the `citizen_address` table. All the data in the column will be lost.
  - You are about to drop the column `postCode` on the `citizen_application_address` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "citizen_address" DROP COLUMN "postCode";

-- AlterTable
ALTER TABLE "citizen_application_address" DROP COLUMN "postCode";
