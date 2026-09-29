/*
  Warnings:

  - You are about to drop the column `content` on the `punctuation` table. All the data in the column will be lost.
  - Added the required column `rawText` to the `punctuation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "punctuation" DROP COLUMN "content",
ADD COLUMN     "academicChapterId" TEXT,
ADD COLUMN     "answerText" TEXT,
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "rawText" TEXT NOT NULL,
ADD COLUMN     "totalMarks" INTEGER DEFAULT 5;

-- CreateIndex
CREATE INDEX "punctuation_academicChapterId_idx" ON "punctuation"("academicChapterId");

-- AddForeignKey
ALTER TABLE "punctuation" ADD CONSTRAINT "punctuation_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
