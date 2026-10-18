-- CreateTable
CREATE TABLE "seen_comprehension" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "passage" TEXT NOT NULL,
    "instruction" TEXT,
    "source" TEXT,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "session" TEXT,
    "comprehensionType" TEXT NOT NULL DEFAULT 'SEEN_COMPREHENSION_1',
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "totalMarks" DOUBLE PRECISION,
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

    CONSTRAINT "seen_comprehension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seen_comprehension_question" (
    "id" TEXT NOT NULL,
    "seenComprehensionId" TEXT NOT NULL,
    "groupNumber" INTEGER NOT NULL DEFAULT 1,
    "groupTitle" TEXT,
    "itemLabel" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'SHORT_ANSWER',
    "question" TEXT NOT NULL,
    "options" JSONB DEFAULT '[]',
    "answer" TEXT,
    "explanation" TEXT,
    "marks" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seen_comprehension_question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "seen_comprehension_createdById_idx" ON "seen_comprehension"("createdById");

-- CreateIndex
CREATE INDEX "seen_comprehension_tenantId_isGlobal_idx" ON "seen_comprehension"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "seen_comprehension_questionTypeId_idx" ON "seen_comprehension"("questionTypeId");

-- CreateIndex
CREATE INDEX "seen_comprehension_comprehensionType_idx" ON "seen_comprehension"("comprehensionType");

-- CreateIndex
CREATE INDEX "seen_comprehension_deletedAt_idx" ON "seen_comprehension"("deletedAt");

-- CreateIndex
CREATE INDEX "seen_comprehension_academicChapterId_idx" ON "seen_comprehension"("academicChapterId");

-- CreateIndex
CREATE INDEX "seen_comprehension_subjectId_idx" ON "seen_comprehension"("subjectId");

-- CreateIndex
CREATE INDEX "seen_comprehension_difficulty_idx" ON "seen_comprehension"("difficulty");

-- CreateIndex
CREATE INDEX "seen_comprehension_question_seenComprehensionId_idx" ON "seen_comprehension_question"("seenComprehensionId");

-- CreateIndex
CREATE INDEX "seen_comprehension_question_groupNumber_idx" ON "seen_comprehension_question"("groupNumber");

-- AddForeignKey
ALTER TABLE "seen_comprehension" ADD CONSTRAINT "seen_comprehension_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seen_comprehension" ADD CONSTRAINT "seen_comprehension_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seen_comprehension" ADD CONSTRAINT "seen_comprehension_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seen_comprehension" ADD CONSTRAINT "seen_comprehension_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seen_comprehension" ADD CONSTRAINT "seen_comprehension_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seen_comprehension" ADD CONSTRAINT "seen_comprehension_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seen_comprehension_question" ADD CONSTRAINT "seen_comprehension_question_seenComprehensionId_fkey" FOREIGN KEY ("seenComprehensionId") REFERENCES "seen_comprehension"("id") ON DELETE CASCADE ON UPDATE CASCADE;
