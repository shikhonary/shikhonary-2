-- CreateTable
CREATE TABLE "make_sentences" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
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

    CONSTRAINT "make_sentences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "make_sentences_createdById_idx" ON "make_sentences"("createdById");

-- CreateIndex
CREATE INDEX "make_sentences_tenantId_isGlobal_idx" ON "make_sentences"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "make_sentences_questionTypeId_idx" ON "make_sentences"("questionTypeId");

-- CreateIndex
CREATE INDEX "make_sentences_deletedAt_idx" ON "make_sentences"("deletedAt");

-- CreateIndex
CREATE INDEX "make_sentences_academicChapterId_idx" ON "make_sentences"("academicChapterId");

-- CreateIndex
CREATE INDEX "make_sentences_subjectId_idx" ON "make_sentences"("subjectId");

-- CreateIndex
CREATE INDEX "make_sentences_difficulty_idx" ON "make_sentences"("difficulty");

-- AddForeignKey
ALTER TABLE "make_sentences" ADD CONSTRAINT "make_sentences_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "make_sentences" ADD CONSTRAINT "make_sentences_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "make_sentences" ADD CONSTRAINT "make_sentences_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "make_sentences" ADD CONSTRAINT "make_sentences_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "make_sentences" ADD CONSTRAINT "make_sentences_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "make_sentences" ADD CONSTRAINT "make_sentences_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
