/*
  Warnings:

  - You are about to drop the column `tenantId` on the `academic_chapter` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `academic_class` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `academic_class` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `academic_subject` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `academic_year` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `academic_year` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "academic_chapter" DROP CONSTRAINT "academic_chapter_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "academic_class" DROP CONSTRAINT "academic_class_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "academic_subject" DROP CONSTRAINT "academic_subject_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "academic_year" DROP CONSTRAINT "academic_year_tenantId_fkey";

-- DropIndex
DROP INDEX "academic_chapter_tenantId_idx";

-- DropIndex
DROP INDEX "academic_class_tenantId_idx";

-- DropIndex
DROP INDEX "academic_subject_tenantId_idx";

-- DropIndex
DROP INDEX "academic_year_tenantId_idx";

-- AlterTable
ALTER TABLE "academic_chapter" DROP COLUMN "tenantId";

-- AlterTable
ALTER TABLE "academic_class" DROP COLUMN "level",
DROP COLUMN "tenantId";

-- AlterTable
ALTER TABLE "academic_subject" DROP COLUMN "tenantId";

-- AlterTable
ALTER TABLE "academic_year" DROP COLUMN "tenantId",
DROP COLUMN "year";
