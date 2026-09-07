-- AlterTable
ALTER TABLE "question_attachment" ADD COLUMN     "bottomContent" TEXT,
ADD COLUMN     "content" TEXT,
ADD COLUMN     "table" JSONB,
ADD COLUMN     "tableBorder" BOOLEAN DEFAULT false,
ALTER COLUMN "url" DROP NOT NULL,
ALTER COLUMN "type" DROP DEFAULT;
