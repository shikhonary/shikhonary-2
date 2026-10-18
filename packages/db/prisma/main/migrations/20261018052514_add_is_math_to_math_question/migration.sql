-- AlterTable
ALTER TABLE "math_question" ADD COLUMN     "isMath" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "math_question_isMath_idx" ON "math_question"("isMath");
