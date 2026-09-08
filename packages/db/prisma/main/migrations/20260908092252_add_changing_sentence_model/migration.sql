-- CreateTable
CREATE TABLE "changing_sentence" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "changing_sentence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "changing_sentence_createdById_idx" ON "changing_sentence"("createdById");

-- CreateIndex
CREATE INDEX "changing_sentence_tenantId_isGlobal_idx" ON "changing_sentence"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "changing_sentence_questionTypeId_idx" ON "changing_sentence"("questionTypeId");

-- CreateIndex
CREATE INDEX "changing_sentence_deletedAt_idx" ON "changing_sentence"("deletedAt");

-- CreateIndex
CREATE INDEX "changing_sentence_subjectId_idx" ON "changing_sentence"("subjectId");

-- CreateIndex
CREATE INDEX "changing_sentence_difficulty_idx" ON "changing_sentence"("difficulty");

-- AddForeignKey
ALTER TABLE "changing_sentence" ADD CONSTRAINT "changing_sentence_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changing_sentence" ADD CONSTRAINT "changing_sentence_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changing_sentence" ADD CONSTRAINT "changing_sentence_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changing_sentence" ADD CONSTRAINT "changing_sentence_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changing_sentence" ADD CONSTRAINT "changing_sentence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
