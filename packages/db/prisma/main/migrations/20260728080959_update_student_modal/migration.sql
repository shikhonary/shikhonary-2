/*
  Warnings:

  - You are about to drop the column `dob` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `fName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `fPhone` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `group` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `mName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `mPhone` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `nameBn` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `permanentAddress` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `presentAddress` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `religion` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `session` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `shift` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Student` table. All the data in the column will be lost.
  - Added the required column `institute` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Student_studentId_idx";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "dob",
DROP COLUMN "fName",
DROP COLUMN "fPhone",
DROP COLUMN "gender",
DROP COLUMN "group",
DROP COLUMN "imageUrl",
DROP COLUMN "mName",
DROP COLUMN "mPhone",
DROP COLUMN "nameBn",
DROP COLUMN "nationality",
DROP COLUMN "permanentAddress",
DROP COLUMN "presentAddress",
DROP COLUMN "religion",
DROP COLUMN "section",
DROP COLUMN "session",
DROP COLUMN "shift",
DROP COLUMN "studentId",
ADD COLUMN     "institute" TEXT NOT NULL,
ADD COLUMN     "isOfflineStudent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT NOT NULL;
