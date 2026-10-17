-- AlterTable
ALTER TABLE "fill_in_the_blanks_without_clues" ADD COLUMN     "isMath" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "fill_in_the_blanks_without_clues_isMath_idx" ON "fill_in_the_blanks_without_clues"("isMath");
