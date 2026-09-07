-- CreateTable
CREATE TABLE "fill_in_the_blanks_with_clues" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "clues" TEXT[] DEFAULT ARRAY[]::TEXT[],
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

    CONSTRAINT "fill_in_the_blanks_with_clues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fill_in_the_blanks_with_clues_createdById_idx" ON "fill_in_the_blanks_with_clues"("createdById");

-- CreateIndex
CREATE INDEX "fill_in_the_blanks_with_clues_tenantId_isGlobal_idx" ON "fill_in_the_blanks_with_clues"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "fill_in_the_blanks_with_clues_questionTypeId_idx" ON "fill_in_the_blanks_with_clues"("questionTypeId");

-- CreateIndex
CREATE INDEX "fill_in_the_blanks_with_clues_deletedAt_idx" ON "fill_in_the_blanks_with_clues"("deletedAt");

-- CreateIndex
CREATE INDEX "fill_in_the_blanks_with_clues_academicChapterId_idx" ON "fill_in_the_blanks_with_clues"("academicChapterId");

-- CreateIndex
CREATE INDEX "fill_in_the_blanks_with_clues_subjectId_idx" ON "fill_in_the_blanks_with_clues"("subjectId");

-- CreateIndex
CREATE INDEX "fill_in_the_blanks_with_clues_difficulty_idx" ON "fill_in_the_blanks_with_clues"("difficulty");

-- AddForeignKey
ALTER TABLE "fill_in_the_blanks_with_clues" ADD CONSTRAINT "fill_in_the_blanks_with_clues_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fill_in_the_blanks_with_clues" ADD CONSTRAINT "fill_in_the_blanks_with_clues_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fill_in_the_blanks_with_clues" ADD CONSTRAINT "fill_in_the_blanks_with_clues_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fill_in_the_blanks_with_clues" ADD CONSTRAINT "fill_in_the_blanks_with_clues_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fill_in_the_blanks_with_clues" ADD CONSTRAINT "fill_in_the_blanks_with_clues_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fill_in_the_blanks_with_clues" ADD CONSTRAINT "fill_in_the_blanks_with_clues_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
