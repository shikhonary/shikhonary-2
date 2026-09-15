-- CreateTable
CREATE TABLE "gender_change" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "genderWord" TEXT,
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

    CONSTRAINT "gender_change_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gender_change_createdById_idx" ON "gender_change"("createdById");

-- CreateIndex
CREATE INDEX "gender_change_tenantId_isGlobal_idx" ON "gender_change"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "gender_change_questionTypeId_idx" ON "gender_change"("questionTypeId");

-- CreateIndex
CREATE INDEX "gender_change_deletedAt_idx" ON "gender_change"("deletedAt");

-- CreateIndex
CREATE INDEX "gender_change_academicChapterId_idx" ON "gender_change"("academicChapterId");

-- CreateIndex
CREATE INDEX "gender_change_subjectId_idx" ON "gender_change"("subjectId");

-- CreateIndex
CREATE INDEX "gender_change_difficulty_idx" ON "gender_change"("difficulty");

-- AddForeignKey
ALTER TABLE "gender_change" ADD CONSTRAINT "gender_change_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gender_change" ADD CONSTRAINT "gender_change_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gender_change" ADD CONSTRAINT "gender_change_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gender_change" ADD CONSTRAINT "gender_change_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gender_change" ADD CONSTRAINT "gender_change_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gender_change" ADD CONSTRAINT "gender_change_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
