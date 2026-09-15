-- CreateTable
CREATE TABLE "word_meaning" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "meaning" TEXT,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "academicChapterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "word_meaning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "word_meaning_createdById_idx" ON "word_meaning"("createdById");

-- CreateIndex
CREATE INDEX "word_meaning_tenantId_isGlobal_idx" ON "word_meaning"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "word_meaning_questionTypeId_idx" ON "word_meaning"("questionTypeId");

-- CreateIndex
CREATE INDEX "word_meaning_deletedAt_idx" ON "word_meaning"("deletedAt");

-- CreateIndex
CREATE INDEX "word_meaning_academicChapterId_idx" ON "word_meaning"("academicChapterId");

-- CreateIndex
CREATE INDEX "word_meaning_subjectId_idx" ON "word_meaning"("subjectId");

-- CreateIndex
CREATE INDEX "word_meaning_difficulty_idx" ON "word_meaning"("difficulty");

-- AddForeignKey
ALTER TABLE "word_meaning" ADD CONSTRAINT "word_meaning_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_meaning" ADD CONSTRAINT "word_meaning_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_meaning" ADD CONSTRAINT "word_meaning_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_meaning" ADD CONSTRAINT "word_meaning_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_meaning" ADD CONSTRAINT "word_meaning_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_meaning" ADD CONSTRAINT "word_meaning_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
