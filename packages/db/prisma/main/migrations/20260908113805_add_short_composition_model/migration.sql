-- CreateTable
CREATE TABLE "short_composition" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "wordLimit" INTEGER,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "short_composition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "short_composition_createdById_idx" ON "short_composition"("createdById");

-- CreateIndex
CREATE INDEX "short_composition_tenantId_isGlobal_idx" ON "short_composition"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "short_composition_questionTypeId_idx" ON "short_composition"("questionTypeId");

-- CreateIndex
CREATE INDEX "short_composition_deletedAt_idx" ON "short_composition"("deletedAt");

-- CreateIndex
CREATE INDEX "short_composition_subjectId_idx" ON "short_composition"("subjectId");

-- CreateIndex
CREATE INDEX "short_composition_difficulty_idx" ON "short_composition"("difficulty");

-- AddForeignKey
ALTER TABLE "short_composition" ADD CONSTRAINT "short_composition_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_composition" ADD CONSTRAINT "short_composition_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_composition" ADD CONSTRAINT "short_composition_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_composition" ADD CONSTRAINT "short_composition_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_composition" ADD CONSTRAINT "short_composition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
