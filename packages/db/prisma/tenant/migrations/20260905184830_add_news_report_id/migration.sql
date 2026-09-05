-- AlterTable
ALTER TABLE "question_paper_question" ADD COLUMN     "newsReportId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "question_paper_question_questionPaperId_newsReportId_key" ON "question_paper_question"("questionPaperId", "newsReportId");

-- CreateIndex
CREATE INDEX "question_paper_question_newsReportId_idx" ON "question_paper_question"("newsReportId");
