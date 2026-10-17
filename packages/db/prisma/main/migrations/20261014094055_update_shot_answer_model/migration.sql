-- AlterTable
ALTER TABLE "short_answer" ADD COLUMN     "options" TEXT[] DEFAULT ARRAY[]::TEXT[];
