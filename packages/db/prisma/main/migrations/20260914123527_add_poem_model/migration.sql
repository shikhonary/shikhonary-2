-- CreateTable
CREATE TABLE "poem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
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

    CONSTRAINT "poem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "poem_createdById_idx" ON "poem"("createdById");

-- CreateIndex
CREATE INDEX "poem_tenantId_isGlobal_idx" ON "poem"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "poem_questionTypeId_idx" ON "poem"("questionTypeId");

-- CreateIndex
CREATE INDEX "poem_deletedAt_idx" ON "poem"("deletedAt");

-- CreateIndex
CREATE INDEX "poem_subjectId_idx" ON "poem"("subjectId");

-- CreateIndex
CREATE INDEX "poem_difficulty_idx" ON "poem"("difficulty");

-- AddForeignKey
ALTER TABLE "poem" ADD CONSTRAINT "poem_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poem" ADD CONSTRAINT "poem_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poem" ADD CONSTRAINT "poem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poem" ADD CONSTRAINT "poem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poem" ADD CONSTRAINT "poem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
