-- AlterTable
ALTER TABLE "question_paper_question" ADD COLUMN     "subSectionId" TEXT;

-- AlterTable
ALTER TABLE "question_paper_subject_mark_distribution" ADD COLUMN     "sectionId" TEXT,
ADD COLUMN     "subSectionId" TEXT;

-- CreateTable
CREATE TABLE "question_paper_sub_section" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleBn" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_paper_sub_section_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_paper_sub_section_sectionId_idx" ON "question_paper_sub_section"("sectionId");

-- CreateIndex
CREATE INDEX "question_paper_question_subSectionId_idx" ON "question_paper_question"("subSectionId");

-- CreateIndex
CREATE INDEX "question_paper_subject_mark_distribution_sectionId_idx" ON "question_paper_subject_mark_distribution"("sectionId");

-- CreateIndex
CREATE INDEX "question_paper_subject_mark_distribution_subSectionId_idx" ON "question_paper_subject_mark_distribution"("subSectionId");

-- AddForeignKey
ALTER TABLE "question_paper_subject_mark_distribution" ADD CONSTRAINT "question_paper_subject_mark_distribution_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "question_paper_section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_paper_subject_mark_distribution" ADD CONSTRAINT "question_paper_subject_mark_distribution_subSectionId_fkey" FOREIGN KEY ("subSectionId") REFERENCES "question_paper_sub_section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_paper_question" ADD CONSTRAINT "question_paper_question_subSectionId_fkey" FOREIGN KEY ("subSectionId") REFERENCES "question_paper_sub_section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_paper_sub_section" ADD CONSTRAINT "question_paper_sub_section_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "question_paper_section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
