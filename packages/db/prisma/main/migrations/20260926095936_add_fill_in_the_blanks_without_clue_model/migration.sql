-- AlterTable
ALTER TABLE "fill_in_the_blanks_without_clues" ADD COLUMN     "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "content" DROP NOT NULL;
