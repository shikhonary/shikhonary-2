-- CreateTable
CREATE TABLE "ek_kothay_prokash" (
    "id" TEXT NOT NULL,
    "phrase" TEXT NOT NULL,
    "oneWord" TEXT,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT,
    "session" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "wordMeaningId" TEXT,
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

    CONSTRAINT "ek_kothay_prokash_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ek_kothay_prokash_wordMeaningId_idx" ON "ek_kothay_prokash"("wordMeaningId");

-- CreateIndex
CREATE INDEX "ek_kothay_prokash_createdById_idx" ON "ek_kothay_prokash"("createdById");

-- CreateIndex
CREATE INDEX "ek_kothay_prokash_tenantId_isGlobal_idx" ON "ek_kothay_prokash"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "ek_kothay_prokash_questionTypeId_idx" ON "ek_kothay_prokash"("questionTypeId");

-- CreateIndex
CREATE INDEX "ek_kothay_prokash_deletedAt_idx" ON "ek_kothay_prokash"("deletedAt");

-- CreateIndex
CREATE INDEX "ek_kothay_prokash_academicChapterId_idx" ON "ek_kothay_prokash"("academicChapterId");

-- CreateIndex
CREATE INDEX "ek_kothay_prokash_subjectId_idx" ON "ek_kothay_prokash"("subjectId");

-- CreateIndex
CREATE INDEX "ek_kothay_prokash_difficulty_idx" ON "ek_kothay_prokash"("difficulty");

-- AddForeignKey
ALTER TABLE "ek_kothay_prokash" ADD CONSTRAINT "ek_kothay_prokash_wordMeaningId_fkey" FOREIGN KEY ("wordMeaningId") REFERENCES "word_meaning"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ek_kothay_prokash" ADD CONSTRAINT "ek_kothay_prokash_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ek_kothay_prokash" ADD CONSTRAINT "ek_kothay_prokash_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ek_kothay_prokash" ADD CONSTRAINT "ek_kothay_prokash_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ek_kothay_prokash" ADD CONSTRAINT "ek_kothay_prokash_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ek_kothay_prokash" ADD CONSTRAINT "ek_kothay_prokash_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ek_kothay_prokash" ADD CONSTRAINT "ek_kothay_prokash_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
