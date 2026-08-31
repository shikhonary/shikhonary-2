-- AlterTable
ALTER TABLE "subject_question_type" ADD COLUMN     "subSectionId" TEXT;

-- CreateTable
CREATE TABLE "subject_question_sub_section" (
    "id" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "sectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_question_sub_section_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subject_question_sub_section_sectionId_idx" ON "subject_question_sub_section"("sectionId");

-- CreateIndex
CREATE INDEX "subject_question_type_subSectionId_idx" ON "subject_question_type"("subSectionId");

-- AddForeignKey
ALTER TABLE "subject_question_type" ADD CONSTRAINT "subject_question_type_subSectionId_fkey" FOREIGN KEY ("subSectionId") REFERENCES "subject_question_sub_section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_question_sub_section" ADD CONSTRAINT "subject_question_sub_section_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "subject_question_section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
