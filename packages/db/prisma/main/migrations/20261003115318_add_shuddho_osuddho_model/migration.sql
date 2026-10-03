-- CreateTable
CREATE TABLE "shuddho_ashuddho" (
    "id" TEXT NOT NULL,
    "sentence" TEXT NOT NULL,
    "answer" TEXT,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT,
    "session" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
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

    CONSTRAINT "shuddho_ashuddho_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shuddho_ashuddho_createdById_idx" ON "shuddho_ashuddho"("createdById");

-- CreateIndex
CREATE INDEX "shuddho_ashuddho_tenantId_isGlobal_idx" ON "shuddho_ashuddho"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "shuddho_ashuddho_questionTypeId_idx" ON "shuddho_ashuddho"("questionTypeId");

-- CreateIndex
CREATE INDEX "shuddho_ashuddho_deletedAt_idx" ON "shuddho_ashuddho"("deletedAt");

-- CreateIndex
CREATE INDEX "shuddho_ashuddho_academicChapterId_idx" ON "shuddho_ashuddho"("academicChapterId");

-- CreateIndex
CREATE INDEX "shuddho_ashuddho_subjectId_idx" ON "shuddho_ashuddho"("subjectId");

-- CreateIndex
CREATE INDEX "shuddho_ashuddho_difficulty_idx" ON "shuddho_ashuddho"("difficulty");

-- AddForeignKey
ALTER TABLE "shuddho_ashuddho" ADD CONSTRAINT "shuddho_ashuddho_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shuddho_ashuddho" ADD CONSTRAINT "shuddho_ashuddho_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shuddho_ashuddho" ADD CONSTRAINT "shuddho_ashuddho_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shuddho_ashuddho" ADD CONSTRAINT "shuddho_ashuddho_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shuddho_ashuddho" ADD CONSTRAINT "shuddho_ashuddho_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shuddho_ashuddho" ADD CONSTRAINT "shuddho_ashuddho_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
