-- CreateTable
CREATE TABLE "parts_of_speech" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
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

    CONSTRAINT "parts_of_speech_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parts_of_speech_createdById_idx" ON "parts_of_speech"("createdById");

-- CreateIndex
CREATE INDEX "parts_of_speech_tenantId_isGlobal_idx" ON "parts_of_speech"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "parts_of_speech_questionTypeId_idx" ON "parts_of_speech"("questionTypeId");

-- CreateIndex
CREATE INDEX "parts_of_speech_deletedAt_idx" ON "parts_of_speech"("deletedAt");

-- CreateIndex
CREATE INDEX "parts_of_speech_academicChapterId_idx" ON "parts_of_speech"("academicChapterId");

-- CreateIndex
CREATE INDEX "parts_of_speech_subjectId_idx" ON "parts_of_speech"("subjectId");

-- CreateIndex
CREATE INDEX "parts_of_speech_difficulty_idx" ON "parts_of_speech"("difficulty");

-- AddForeignKey
ALTER TABLE "parts_of_speech" ADD CONSTRAINT "parts_of_speech_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts_of_speech" ADD CONSTRAINT "parts_of_speech_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts_of_speech" ADD CONSTRAINT "parts_of_speech_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts_of_speech" ADD CONSTRAINT "parts_of_speech_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts_of_speech" ADD CONSTRAINT "parts_of_speech_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts_of_speech" ADD CONSTRAINT "parts_of_speech_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
