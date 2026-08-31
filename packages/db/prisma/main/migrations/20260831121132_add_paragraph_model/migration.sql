-- CreateTable
CREATE TABLE "paragraph" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionTypeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paragraph_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "paragraph_chapterId_idx" ON "paragraph"("chapterId");

-- CreateIndex
CREATE INDEX "paragraph_subjectId_idx" ON "paragraph"("subjectId");

-- CreateIndex
CREATE INDEX "paragraph_difficulty_idx" ON "paragraph"("difficulty");

-- AddForeignKey
ALTER TABLE "paragraph" ADD CONSTRAINT "paragraph_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paragraph" ADD CONSTRAINT "paragraph_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paragraph" ADD CONSTRAINT "paragraph_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;
