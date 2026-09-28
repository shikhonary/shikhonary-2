-- CreateTable
CREATE TABLE "verb_tense" (
    "id" TEXT NOT NULL,
    "verb" TEXT NOT NULL,
    "presentForm" TEXT,
    "pastForm" TEXT,
    "futureForm" TEXT,
    "content" TEXT,
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

    CONSTRAINT "verb_tense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verb_tense_createdById_idx" ON "verb_tense"("createdById");

-- CreateIndex
CREATE INDEX "verb_tense_tenantId_isGlobal_idx" ON "verb_tense"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "verb_tense_questionTypeId_idx" ON "verb_tense"("questionTypeId");

-- CreateIndex
CREATE INDEX "verb_tense_deletedAt_idx" ON "verb_tense"("deletedAt");

-- CreateIndex
CREATE INDEX "verb_tense_academicChapterId_idx" ON "verb_tense"("academicChapterId");

-- CreateIndex
CREATE INDEX "verb_tense_subjectId_idx" ON "verb_tense"("subjectId");

-- CreateIndex
CREATE INDEX "verb_tense_difficulty_idx" ON "verb_tense"("difficulty");

-- AddForeignKey
ALTER TABLE "verb_tense" ADD CONSTRAINT "verb_tense_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verb_tense" ADD CONSTRAINT "verb_tense_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verb_tense" ADD CONSTRAINT "verb_tense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verb_tense" ADD CONSTRAINT "verb_tense_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verb_tense" ADD CONSTRAINT "verb_tense_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verb_tense" ADD CONSTRAINT "verb_tense_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
