-- CreateTable
CREATE TABLE "cs" (
    "id" TEXT NOT NULL,
    "questionA" TEXT NOT NULL,
    "questionB" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionTypeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cs_chapterId_idx" ON "cs"("chapterId");

-- CreateIndex
CREATE INDEX "cs_subjectId_idx" ON "cs"("subjectId");

-- CreateIndex
CREATE INDEX "cs_difficulty_idx" ON "cs"("difficulty");

-- AddForeignKey
ALTER TABLE "cs" ADD CONSTRAINT "cs_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cs" ADD CONSTRAINT "cs_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cs" ADD CONSTRAINT "cs_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;
