-- AlterTable
ALTER TABLE "question_attachment" ADD COLUMN     "shortQuestionId" TEXT;

-- CreateTable
CREATE TABLE "short_question" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
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

    CONSTRAINT "short_question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "short_question_createdById_idx" ON "short_question"("createdById");

-- CreateIndex
CREATE INDEX "short_question_tenantId_isGlobal_idx" ON "short_question"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "short_question_questionTypeId_idx" ON "short_question"("questionTypeId");

-- CreateIndex
CREATE INDEX "short_question_deletedAt_idx" ON "short_question"("deletedAt");

-- CreateIndex
CREATE INDEX "short_question_subjectId_chapterId_idx" ON "short_question"("subjectId", "chapterId");

-- CreateIndex
CREATE INDEX "short_question_chapterId_idx" ON "short_question"("chapterId");

-- CreateIndex
CREATE INDEX "short_question_subjectId_idx" ON "short_question"("subjectId");

-- CreateIndex
CREATE INDEX "short_question_difficulty_idx" ON "short_question"("difficulty");

-- CreateIndex
CREATE INDEX "question_attachment_shortQuestionId_idx" ON "question_attachment"("shortQuestionId");

-- AddForeignKey
ALTER TABLE "question_attachment" ADD CONSTRAINT "question_attachment_shortQuestionId_fkey" FOREIGN KEY ("shortQuestionId") REFERENCES "short_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_question" ADD CONSTRAINT "short_question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_question" ADD CONSTRAINT "short_question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_question" ADD CONSTRAINT "short_question_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_question" ADD CONSTRAINT "short_question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_question" ADD CONSTRAINT "short_question_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_question" ADD CONSTRAINT "short_question_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
