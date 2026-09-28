-- CreateTable
CREATE TABLE "sadhu_to_cholito" (
    "id" TEXT NOT NULL,
    "sadhuText" TEXT NOT NULL,
    "cholitoText" TEXT,
    "alternativeTexts" TEXT[] DEFAULT ARRAY[]::TEXT[],
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

    CONSTRAINT "sadhu_to_cholito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sadhu_to_cholito_createdById_idx" ON "sadhu_to_cholito"("createdById");

-- CreateIndex
CREATE INDEX "sadhu_to_cholito_tenantId_isGlobal_idx" ON "sadhu_to_cholito"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "sadhu_to_cholito_questionTypeId_idx" ON "sadhu_to_cholito"("questionTypeId");

-- CreateIndex
CREATE INDEX "sadhu_to_cholito_deletedAt_idx" ON "sadhu_to_cholito"("deletedAt");

-- CreateIndex
CREATE INDEX "sadhu_to_cholito_subjectId_idx" ON "sadhu_to_cholito"("subjectId");

-- CreateIndex
CREATE INDEX "sadhu_to_cholito_academicChapterId_idx" ON "sadhu_to_cholito"("academicChapterId");

-- CreateIndex
CREATE INDEX "sadhu_to_cholito_difficulty_idx" ON "sadhu_to_cholito"("difficulty");

-- AddForeignKey
ALTER TABLE "sadhu_to_cholito" ADD CONSTRAINT "sadhu_to_cholito_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sadhu_to_cholito" ADD CONSTRAINT "sadhu_to_cholito_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sadhu_to_cholito" ADD CONSTRAINT "sadhu_to_cholito_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sadhu_to_cholito" ADD CONSTRAINT "sadhu_to_cholito_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sadhu_to_cholito" ADD CONSTRAINT "sadhu_to_cholito_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sadhu_to_cholito" ADD CONSTRAINT "sadhu_to_cholito_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
