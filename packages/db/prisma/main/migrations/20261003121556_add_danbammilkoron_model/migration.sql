-- CreateTable
CREATE TABLE "dan_bam_milkoron" (
    "id" TEXT NOT NULL,
    "leftColumn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rightColumn" TEXT[] DEFAULT ARRAY[]::TEXT[],
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

    CONSTRAINT "dan_bam_milkoron_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dan_bam_milkoron_createdById_idx" ON "dan_bam_milkoron"("createdById");

-- CreateIndex
CREATE INDEX "dan_bam_milkoron_tenantId_isGlobal_idx" ON "dan_bam_milkoron"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "dan_bam_milkoron_questionTypeId_idx" ON "dan_bam_milkoron"("questionTypeId");

-- CreateIndex
CREATE INDEX "dan_bam_milkoron_deletedAt_idx" ON "dan_bam_milkoron"("deletedAt");

-- CreateIndex
CREATE INDEX "dan_bam_milkoron_academicChapterId_idx" ON "dan_bam_milkoron"("academicChapterId");

-- CreateIndex
CREATE INDEX "dan_bam_milkoron_subjectId_idx" ON "dan_bam_milkoron"("subjectId");

-- CreateIndex
CREATE INDEX "dan_bam_milkoron_difficulty_idx" ON "dan_bam_milkoron"("difficulty");

-- AddForeignKey
ALTER TABLE "dan_bam_milkoron" ADD CONSTRAINT "dan_bam_milkoron_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dan_bam_milkoron" ADD CONSTRAINT "dan_bam_milkoron_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dan_bam_milkoron" ADD CONSTRAINT "dan_bam_milkoron_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dan_bam_milkoron" ADD CONSTRAINT "dan_bam_milkoron_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dan_bam_milkoron" ADD CONSTRAINT "dan_bam_milkoron_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dan_bam_milkoron" ADD CONSTRAINT "dan_bam_milkoron_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
