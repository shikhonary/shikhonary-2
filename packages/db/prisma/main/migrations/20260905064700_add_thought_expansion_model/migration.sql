-- CreateTable
CREATE TABLE "thought_expansion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thought_expansion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "thought_expansion_subjectId_idx" ON "thought_expansion"("subjectId");

-- CreateIndex
CREATE INDEX "thought_expansion_difficulty_idx" ON "thought_expansion"("difficulty");

-- AddForeignKey
ALTER TABLE "thought_expansion" ADD CONSTRAINT "thought_expansion_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_expansion" ADD CONSTRAINT "thought_expansion_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
