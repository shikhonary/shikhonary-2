/*
  Warnings:

  - Added the required column `classId` to the `cq` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classId` to the `mcq` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classId` to the `short_answer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cq" ADD COLUMN     "classId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "mcq" ADD COLUMN     "classId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "short_answer" ADD COLUMN     "classId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "cq_classId_idx" ON "cq"("classId");

-- CreateIndex
CREATE INDEX "mcq_classId_idx" ON "mcq"("classId");

-- CreateIndex
CREATE INDEX "short_answer_classId_idx" ON "short_answer"("classId");

-- AddForeignKey
ALTER TABLE "mcq" ADD CONSTRAINT "mcq_classId_fkey" FOREIGN KEY ("classId") REFERENCES "academic_class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_classId_fkey" FOREIGN KEY ("classId") REFERENCES "academic_class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_answer" ADD CONSTRAINT "short_answer_classId_fkey" FOREIGN KEY ("classId") REFERENCES "academic_class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
