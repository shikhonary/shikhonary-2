/*
  Warnings:

  - You are about to drop the column `status` on the `citizen` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[citizenId]` on the table `citizen` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `citizenId` to the `citizen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "citizen" DROP COLUMN "status",
ADD COLUMN     "citizenId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "citizen_citizenId_key" ON "citizen"("citizenId");
