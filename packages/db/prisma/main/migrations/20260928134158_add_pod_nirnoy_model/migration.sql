-- CreateTable
CREATE TABLE "pod_nirnoy" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "words" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT,
    "session" TEXT,
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

    CONSTRAINT "pod_nirnoy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pod_nirnoy_createdById_idx" ON "pod_nirnoy"("createdById");

-- CreateIndex
CREATE INDEX "pod_nirnoy_tenantId_isGlobal_idx" ON "pod_nirnoy"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "pod_nirnoy_questionTypeId_idx" ON "pod_nirnoy"("questionTypeId");

-- CreateIndex
CREATE INDEX "pod_nirnoy_deletedAt_idx" ON "pod_nirnoy"("deletedAt");

-- CreateIndex
CREATE INDEX "pod_nirnoy_academicChapterId_idx" ON "pod_nirnoy"("academicChapterId");

-- CreateIndex
CREATE INDEX "pod_nirnoy_subjectId_idx" ON "pod_nirnoy"("subjectId");

-- CreateIndex
CREATE INDEX "pod_nirnoy_difficulty_idx" ON "pod_nirnoy"("difficulty");

-- AddForeignKey
ALTER TABLE "pod_nirnoy" ADD CONSTRAINT "pod_nirnoy_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pod_nirnoy" ADD CONSTRAINT "pod_nirnoy_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pod_nirnoy" ADD CONSTRAINT "pod_nirnoy_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pod_nirnoy" ADD CONSTRAINT "pod_nirnoy_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pod_nirnoy" ADD CONSTRAINT "pod_nirnoy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pod_nirnoy" ADD CONSTRAINT "pod_nirnoy_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
