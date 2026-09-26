-- CreateTable
CREATE TABLE "opposite_word" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "oppositeWord" TEXT,
    "oppositeWords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT,
    "session" TEXT,
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

    CONSTRAINT "opposite_word_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "opposite_word_createdById_idx" ON "opposite_word"("createdById");

-- CreateIndex
CREATE INDEX "opposite_word_tenantId_isGlobal_idx" ON "opposite_word"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "opposite_word_questionTypeId_idx" ON "opposite_word"("questionTypeId");

-- CreateIndex
CREATE INDEX "opposite_word_deletedAt_idx" ON "opposite_word"("deletedAt");

-- CreateIndex
CREATE INDEX "opposite_word_academicChapterId_idx" ON "opposite_word"("academicChapterId");

-- CreateIndex
CREATE INDEX "opposite_word_subjectId_idx" ON "opposite_word"("subjectId");

-- CreateIndex
CREATE INDEX "opposite_word_difficulty_idx" ON "opposite_word"("difficulty");

-- AddForeignKey
ALTER TABLE "opposite_word" ADD CONSTRAINT "opposite_word_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opposite_word" ADD CONSTRAINT "opposite_word_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opposite_word" ADD CONSTRAINT "opposite_word_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opposite_word" ADD CONSTRAINT "opposite_word_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opposite_word" ADD CONSTRAINT "opposite_word_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opposite_word" ADD CONSTRAINT "opposite_word_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
