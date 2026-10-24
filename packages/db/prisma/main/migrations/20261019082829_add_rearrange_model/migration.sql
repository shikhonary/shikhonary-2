-- CreateTable
CREATE TABLE "rearrange" (
    "id" TEXT NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "answerKey" TEXT,
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

    CONSTRAINT "rearrange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rearrange_createdById_idx" ON "rearrange"("createdById");

-- CreateIndex
CREATE INDEX "rearrange_tenantId_isGlobal_idx" ON "rearrange"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "rearrange_questionTypeId_idx" ON "rearrange"("questionTypeId");

-- CreateIndex
CREATE INDEX "rearrange_deletedAt_idx" ON "rearrange"("deletedAt");

-- CreateIndex
CREATE INDEX "rearrange_academicChapterId_idx" ON "rearrange"("academicChapterId");

-- CreateIndex
CREATE INDEX "rearrange_subjectId_idx" ON "rearrange"("subjectId");

-- CreateIndex
CREATE INDEX "rearrange_difficulty_idx" ON "rearrange"("difficulty");

-- AddForeignKey
ALTER TABLE "rearrange" ADD CONSTRAINT "rearrange_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rearrange" ADD CONSTRAINT "rearrange_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rearrange" ADD CONSTRAINT "rearrange_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rearrange" ADD CONSTRAINT "rearrange_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rearrange" ADD CONSTRAINT "rearrange_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rearrange" ADD CONSTRAINT "rearrange_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
