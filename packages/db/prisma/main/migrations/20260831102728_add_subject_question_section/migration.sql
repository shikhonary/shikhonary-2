-- AlterTable
ALTER TABLE "subject_question_type" ADD COLUMN     "sectionId" TEXT;

-- CreateTable
CREATE TABLE "subject_question_section" (
    "id" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_question_section_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subject_question_section_subjectId_idx" ON "subject_question_section"("subjectId");

-- CreateIndex
CREATE INDEX "subject_question_type_sectionId_idx" ON "subject_question_type"("sectionId");

-- AddForeignKey
ALTER TABLE "subject_question_type" ADD CONSTRAINT "subject_question_type_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "subject_question_section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_question_section" ADD CONSTRAINT "subject_question_section_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
