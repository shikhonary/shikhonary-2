-- CreateTable
CREATE TABLE "essence" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "essence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "essence_subjectId_idx" ON "essence"("subjectId");

-- CreateIndex
CREATE INDEX "essence_difficulty_idx" ON "essence"("difficulty");

-- AddForeignKey
ALTER TABLE "essence" ADD CONSTRAINT "essence_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essence" ADD CONSTRAINT "essence_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
