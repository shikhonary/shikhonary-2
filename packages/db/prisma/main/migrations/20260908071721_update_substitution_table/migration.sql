/*
  Warnings:

  - You are about to drop the column `academicChapterId` on the `substitution_table` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "substitution_table" DROP CONSTRAINT "substitution_table_academicChapterId_fkey";

-- DropIndex
DROP INDEX "substitution_table_academicChapterId_idx";

-- AlterTable
ALTER TABLE "substitution_table" DROP COLUMN "academicChapterId";
