-- CreateTable
CREATE TABLE "right_form_of_verb" (
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

    CONSTRAINT "right_form_of_verb_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "right_form_of_verb_createdById_idx" ON "right_form_of_verb"("createdById");

-- CreateIndex
CREATE INDEX "right_form_of_verb_tenantId_isGlobal_idx" ON "right_form_of_verb"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "right_form_of_verb_questionTypeId_idx" ON "right_form_of_verb"("questionTypeId");

-- CreateIndex
CREATE INDEX "right_form_of_verb_deletedAt_idx" ON "right_form_of_verb"("deletedAt");

-- CreateIndex
CREATE INDEX "right_form_of_verb_academicChapterId_idx" ON "right_form_of_verb"("academicChapterId");

-- CreateIndex
CREATE INDEX "right_form_of_verb_subjectId_idx" ON "right_form_of_verb"("subjectId");

-- CreateIndex
CREATE INDEX "right_form_of_verb_difficulty_idx" ON "right_form_of_verb"("difficulty");

-- AddForeignKey
ALTER TABLE "right_form_of_verb" ADD CONSTRAINT "right_form_of_verb_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "right_form_of_verb" ADD CONSTRAINT "right_form_of_verb_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "right_form_of_verb" ADD CONSTRAINT "right_form_of_verb_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "right_form_of_verb" ADD CONSTRAINT "right_form_of_verb_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "right_form_of_verb" ADD CONSTRAINT "right_form_of_verb_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "right_form_of_verb" ADD CONSTRAINT "right_form_of_verb_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
