-- CreateTable
CREATE TABLE "make_question" (
    "id" TEXT NOT NULL,
    "statement" TEXT,
    "answer" TEXT,
    "clue" TEXT,
    "context" TEXT,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT,
    "session" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "essenceId" TEXT,
    "subjectId" TEXT NOT NULL,
    "academicChapterId" TEXT,
    "questionTypeId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "make_question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "make_question_essenceId_idx" ON "make_question"("essenceId");

-- CreateIndex
CREATE INDEX "make_question_createdById_idx" ON "make_question"("createdById");

-- CreateIndex
CREATE INDEX "make_question_tenantId_isGlobal_idx" ON "make_question"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "make_question_questionTypeId_idx" ON "make_question"("questionTypeId");

-- CreateIndex
CREATE INDEX "make_question_deletedAt_idx" ON "make_question"("deletedAt");

-- CreateIndex
CREATE INDEX "make_question_subjectId_idx" ON "make_question"("subjectId");

-- CreateIndex
CREATE INDEX "make_question_academicChapterId_idx" ON "make_question"("academicChapterId");

-- CreateIndex
CREATE INDEX "make_question_difficulty_idx" ON "make_question"("difficulty");

-- AddForeignKey
ALTER TABLE "make_question" ADD CONSTRAINT "make_question_essenceId_fkey" FOREIGN KEY ("essenceId") REFERENCES "essence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "make_question" ADD CONSTRAINT "make_question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "make_question" ADD CONSTRAINT "make_question_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "make_question" ADD CONSTRAINT "make_question_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "make_question" ADD CONSTRAINT "make_question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "make_question" ADD CONSTRAINT "make_question_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "make_question" ADD CONSTRAINT "make_question_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
