-- CreateTable
CREATE TABLE "substitution_table" (
    "id" TEXT NOT NULL,
    "columnA" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "columnB" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "columnC" TEXT[] DEFAULT ARRAY[]::TEXT[],
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

    CONSTRAINT "substitution_table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "substitution_table_createdById_idx" ON "substitution_table"("createdById");

-- CreateIndex
CREATE INDEX "substitution_table_tenantId_isGlobal_idx" ON "substitution_table"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "substitution_table_questionTypeId_idx" ON "substitution_table"("questionTypeId");

-- CreateIndex
CREATE INDEX "substitution_table_deletedAt_idx" ON "substitution_table"("deletedAt");

-- CreateIndex
CREATE INDEX "substitution_table_academicChapterId_idx" ON "substitution_table"("academicChapterId");

-- CreateIndex
CREATE INDEX "substitution_table_subjectId_idx" ON "substitution_table"("subjectId");

-- CreateIndex
CREATE INDEX "substitution_table_difficulty_idx" ON "substitution_table"("difficulty");

-- AddForeignKey
ALTER TABLE "substitution_table" ADD CONSTRAINT "substitution_table_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substitution_table" ADD CONSTRAINT "substitution_table_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substitution_table" ADD CONSTRAINT "substitution_table_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substitution_table" ADD CONSTRAINT "substitution_table_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substitution_table" ADD CONSTRAINT "substitution_table_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substitution_table" ADD CONSTRAINT "substitution_table_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
