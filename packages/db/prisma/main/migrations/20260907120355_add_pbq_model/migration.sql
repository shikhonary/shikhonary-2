-- CreateTable
CREATE TABLE "pbq" (
    "id" TEXT NOT NULL,
    "questionA" TEXT NOT NULL,
    "questionB" TEXT NOT NULL,
    "questionC" TEXT NOT NULL,
    "questionD" TEXT NOT NULL,
    "questionE" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "marks" JSONB,
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
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

    CONSTRAINT "pbq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pbq_createdById_idx" ON "pbq"("createdById");

-- CreateIndex
CREATE INDEX "pbq_tenantId_isGlobal_idx" ON "pbq"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "pbq_questionTypeId_idx" ON "pbq"("questionTypeId");

-- CreateIndex
CREATE INDEX "pbq_deletedAt_idx" ON "pbq"("deletedAt");

-- CreateIndex
CREATE INDEX "pbq_subjectId_idx" ON "pbq"("subjectId");

-- CreateIndex
CREATE INDEX "pbq_academicChapterId_idx" ON "pbq"("academicChapterId");

-- CreateIndex
CREATE INDEX "pbq_difficulty_idx" ON "pbq"("difficulty");

-- AddForeignKey
ALTER TABLE "pbq" ADD CONSTRAINT "pbq_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pbq" ADD CONSTRAINT "pbq_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pbq" ADD CONSTRAINT "pbq_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pbq" ADD CONSTRAINT "pbq_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pbq" ADD CONSTRAINT "pbq_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pbq" ADD CONSTRAINT "pbq_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
