-- AlterTable
ALTER TABLE "question_attachment" ADD COLUMN     "descriptiveQuestionId" TEXT;

-- CreateTable
CREATE TABLE "descriptive_question" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionTypeId" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "descriptive_question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "descriptive_question_createdById_idx" ON "descriptive_question"("createdById");

-- CreateIndex
CREATE INDEX "descriptive_question_tenantId_isGlobal_idx" ON "descriptive_question"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "descriptive_question_questionTypeId_idx" ON "descriptive_question"("questionTypeId");

-- CreateIndex
CREATE INDEX "descriptive_question_deletedAt_idx" ON "descriptive_question"("deletedAt");

-- CreateIndex
CREATE INDEX "descriptive_question_subjectId_chapterId_idx" ON "descriptive_question"("subjectId", "chapterId");

-- CreateIndex
CREATE INDEX "descriptive_question_chapterId_idx" ON "descriptive_question"("chapterId");

-- CreateIndex
CREATE INDEX "descriptive_question_subjectId_idx" ON "descriptive_question"("subjectId");

-- CreateIndex
CREATE INDEX "descriptive_question_difficulty_idx" ON "descriptive_question"("difficulty");

-- CreateIndex
CREATE INDEX "question_attachment_descriptiveQuestionId_idx" ON "question_attachment"("descriptiveQuestionId");

-- AddForeignKey
ALTER TABLE "question_attachment" ADD CONSTRAINT "question_attachment_descriptiveQuestionId_fkey" FOREIGN KEY ("descriptiveQuestionId") REFERENCES "descriptive_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descriptive_question" ADD CONSTRAINT "descriptive_question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descriptive_question" ADD CONSTRAINT "descriptive_question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descriptive_question" ADD CONSTRAINT "descriptive_question_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descriptive_question" ADD CONSTRAINT "descriptive_question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descriptive_question" ADD CONSTRAINT "descriptive_question_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descriptive_question" ADD CONSTRAINT "descriptive_question_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
