-- CreateTable
CREATE TABLE "number_in_words" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "inWords" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT,
    "session" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "wordMeaningId" TEXT,
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

    CONSTRAINT "number_in_words_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "number_in_words_wordMeaningId_idx" ON "number_in_words"("wordMeaningId");

-- CreateIndex
CREATE INDEX "number_in_words_createdById_idx" ON "number_in_words"("createdById");

-- CreateIndex
CREATE INDEX "number_in_words_tenantId_isGlobal_idx" ON "number_in_words"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "number_in_words_questionTypeId_idx" ON "number_in_words"("questionTypeId");

-- CreateIndex
CREATE INDEX "number_in_words_deletedAt_idx" ON "number_in_words"("deletedAt");

-- CreateIndex
CREATE INDEX "number_in_words_academicChapterId_idx" ON "number_in_words"("academicChapterId");

-- CreateIndex
CREATE INDEX "number_in_words_subjectId_idx" ON "number_in_words"("subjectId");

-- CreateIndex
CREATE INDEX "number_in_words_difficulty_idx" ON "number_in_words"("difficulty");

-- AddForeignKey
ALTER TABLE "number_in_words" ADD CONSTRAINT "number_in_words_wordMeaningId_fkey" FOREIGN KEY ("wordMeaningId") REFERENCES "word_meaning"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_in_words" ADD CONSTRAINT "number_in_words_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_in_words" ADD CONSTRAINT "number_in_words_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_in_words" ADD CONSTRAINT "number_in_words_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_in_words" ADD CONSTRAINT "number_in_words_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_in_words" ADD CONSTRAINT "number_in_words_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_in_words" ADD CONSTRAINT "number_in_words_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
