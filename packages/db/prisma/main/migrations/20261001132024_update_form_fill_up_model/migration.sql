-- AlterTable
ALTER TABLE "form_fillup" ADD COLUMN     "declaration" TEXT,
ADD COLUMN     "hasPhoto" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "signatures" TEXT[] DEFAULT ARRAY[]::TEXT[];
