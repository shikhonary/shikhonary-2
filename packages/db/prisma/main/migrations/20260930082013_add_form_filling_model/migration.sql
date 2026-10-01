-- CreateTable
CREATE TABLE "form_fillup" (
    "id" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "formData" JSONB NOT NULL,
    "solution" JSONB,
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

    CONSTRAINT "form_fillup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "form_fillup_createdById_idx" ON "form_fillup"("createdById");

-- CreateIndex
CREATE INDEX "form_fillup_tenantId_isGlobal_idx" ON "form_fillup"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "form_fillup_questionTypeId_idx" ON "form_fillup"("questionTypeId");

-- CreateIndex
CREATE INDEX "form_fillup_deletedAt_idx" ON "form_fillup"("deletedAt");

-- CreateIndex
CREATE INDEX "form_fillup_academicChapterId_idx" ON "form_fillup"("academicChapterId");

-- CreateIndex
CREATE INDEX "form_fillup_subjectId_idx" ON "form_fillup"("subjectId");

-- CreateIndex
CREATE INDEX "form_fillup_difficulty_idx" ON "form_fillup"("difficulty");

-- AddForeignKey
ALTER TABLE "form_fillup" ADD CONSTRAINT "form_fillup_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fillup" ADD CONSTRAINT "form_fillup_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fillup" ADD CONSTRAINT "form_fillup_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fillup" ADD CONSTRAINT "form_fillup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fillup" ADD CONSTRAINT "form_fillup_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fillup" ADD CONSTRAINT "form_fillup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
