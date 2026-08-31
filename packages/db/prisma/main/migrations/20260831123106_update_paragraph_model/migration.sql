/*
  Warnings:

  - Made the column `questionTypeId` on table `paragraph` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "paragraph" DROP CONSTRAINT "paragraph_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "paragraph" DROP CONSTRAINT "paragraph_questionTypeId_fkey";

-- AlterTable
ALTER TABLE "paragraph" ALTER COLUMN "chapterId" DROP NOT NULL,
ALTER COLUMN "questionTypeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "paragraph" ADD CONSTRAINT "paragraph_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paragraph" ADD CONSTRAINT "paragraph_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
