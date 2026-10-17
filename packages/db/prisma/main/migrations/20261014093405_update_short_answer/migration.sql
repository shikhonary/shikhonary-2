-- AlterTable
ALTER TABLE "short_answer" ADD COLUMN     "isMath" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "short_answer_isMath_idx" ON "short_answer"("isMath");
