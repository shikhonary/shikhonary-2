-- CreateTable
CREATE TABLE "synonym" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "synonymWord" TEXT,
    "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
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

    CONSTRAINT "synonym_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "synonym_createdById_idx" ON "synonym"("createdById");

-- CreateIndex
CREATE INDEX "synonym_tenantId_isGlobal_idx" ON "synonym"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "synonym_questionTypeId_idx" ON "synonym"("questionTypeId");

-- CreateIndex
CREATE INDEX "synonym_deletedAt_idx" ON "synonym"("deletedAt");

-- CreateIndex
CREATE INDEX "synonym_academicChapterId_idx" ON "synonym"("academicChapterId");

-- CreateIndex
CREATE INDEX "synonym_subjectId_idx" ON "synonym"("subjectId");

-- CreateIndex
CREATE INDEX "synonym_difficulty_idx" ON "synonym"("difficulty");

-- AddForeignKey
ALTER TABLE "synonym" ADD CONSTRAINT "synonym_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synonym" ADD CONSTRAINT "synonym_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synonym" ADD CONSTRAINT "synonym_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synonym" ADD CONSTRAINT "synonym_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synonym" ADD CONSTRAINT "synonym_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synonym" ADD CONSTRAINT "synonym_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
