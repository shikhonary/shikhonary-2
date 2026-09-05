-- CreateTable
CREATE TABLE "essay" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "essay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "essay_subjectId_idx" ON "essay"("subjectId");

-- CreateIndex
CREATE INDEX "essay_difficulty_idx" ON "essay"("difficulty");

-- AddForeignKey
ALTER TABLE "essay" ADD CONSTRAINT "essay_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essay" ADD CONSTRAINT "essay_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
