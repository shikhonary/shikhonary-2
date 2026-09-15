-- CreateTable
CREATE TABLE "juktoborno" (
    "id" TEXT NOT NULL,
    "juktoborno" TEXT NOT NULL,
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

    CONSTRAINT "juktoborno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "juktoborno_createdById_idx" ON "juktoborno"("createdById");

-- CreateIndex
CREATE INDEX "juktoborno_tenantId_isGlobal_idx" ON "juktoborno"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "juktoborno_questionTypeId_idx" ON "juktoborno"("questionTypeId");

-- CreateIndex
CREATE INDEX "juktoborno_deletedAt_idx" ON "juktoborno"("deletedAt");

-- CreateIndex
CREATE INDEX "juktoborno_academicChapterId_idx" ON "juktoborno"("academicChapterId");

-- CreateIndex
CREATE INDEX "juktoborno_subjectId_idx" ON "juktoborno"("subjectId");

-- CreateIndex
CREATE INDEX "juktoborno_difficulty_idx" ON "juktoborno"("difficulty");

-- AddForeignKey
ALTER TABLE "juktoborno" ADD CONSTRAINT "juktoborno_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "juktoborno" ADD CONSTRAINT "juktoborno_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "juktoborno" ADD CONSTRAINT "juktoborno_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "juktoborno" ADD CONSTRAINT "juktoborno_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "juktoborno" ADD CONSTRAINT "juktoborno_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "juktoborno" ADD CONSTRAINT "juktoborno_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
