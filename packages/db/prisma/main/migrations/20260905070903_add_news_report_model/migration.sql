-- CreateTable
CREATE TABLE "news_report" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "news_report_subjectId_idx" ON "news_report"("subjectId");

-- CreateIndex
CREATE INDEX "news_report_difficulty_idx" ON "news_report"("difficulty");

-- AddForeignKey
ALTER TABLE "news_report" ADD CONSTRAINT "news_report_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_report" ADD CONSTRAINT "news_report_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
