-- CreateTable
CREATE TABLE "amplification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT,
    "questionTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "amplification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "amplification_chapterId_idx" ON "amplification"("chapterId");

-- CreateIndex
CREATE INDEX "amplification_subjectId_idx" ON "amplification"("subjectId");

-- CreateIndex
CREATE INDEX "amplification_difficulty_idx" ON "amplification"("difficulty");

-- AddForeignKey
ALTER TABLE "amplification" ADD CONSTRAINT "amplification_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amplification" ADD CONSTRAINT "amplification_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amplification" ADD CONSTRAINT "amplification_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
