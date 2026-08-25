-- CreateTable
CREATE TABLE "question_type" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "mark" DOUBLE PRECISION NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "descriptionEn" TEXT,
    "descriptionBn" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_question_type" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "questionTypeId" TEXT NOT NULL,
    "mark" DOUBLE PRECISION NOT NULL,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "requiredCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subject_question_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mcq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "options" TEXT[],
    "statements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "type" TEXT NOT NULL,
    "isMath" BOOLEAN NOT NULL DEFAULT false,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "explanation" TEXT,
    "questionUrl" TEXT,
    "contextId" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "year" INTEGER,
    "source" TEXT,
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionTypeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mcq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cq" (
    "id" TEXT NOT NULL,
    "questionA" TEXT NOT NULL,
    "questionB" TEXT NOT NULL,
    "questionC" TEXT NOT NULL,
    "questionD" TEXT,
    "context" TEXT,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "year" INTEGER,
    "source" TEXT,
    "marks" JSONB,
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionTypeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_attachment" (
    "id" TEXT NOT NULL,
    "mcqId" TEXT,
    "cqId" TEXT,
    "shortAnswerId" TEXT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'image',
    "caption" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cq_answer" (
    "id" TEXT NOT NULL,
    "cqId" TEXT NOT NULL,
    "answerA" TEXT,
    "answerB" TEXT,
    "answerC" TEXT,
    "answerD" TEXT,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cq_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "short_answer" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "year" INTEGER,
    "source" TEXT,
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionTypeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "short_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_report" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "resolvedNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "question_type_label_key" ON "question_type"("label");

-- CreateIndex
CREATE INDEX "question_type_label_idx" ON "question_type"("label");

-- CreateIndex
CREATE INDEX "question_type_isActive_idx" ON "question_type"("isActive");

-- CreateIndex
CREATE INDEX "subject_question_type_subjectId_idx" ON "subject_question_type"("subjectId");

-- CreateIndex
CREATE INDEX "subject_question_type_questionTypeId_idx" ON "subject_question_type"("questionTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "subject_question_type_subjectId_questionTypeId_key" ON "subject_question_type"("subjectId", "questionTypeId");

-- CreateIndex
CREATE INDEX "mcq_chapterId_idx" ON "mcq"("chapterId");

-- CreateIndex
CREATE INDEX "mcq_chapterId_type_idx" ON "mcq"("chapterId", "type");

-- CreateIndex
CREATE INDEX "mcq_isMath_idx" ON "mcq"("isMath");

-- CreateIndex
CREATE INDEX "mcq_subjectId_chapterId_idx" ON "mcq"("subjectId", "chapterId");

-- CreateIndex
CREATE INDEX "mcq_subjectId_idx" ON "mcq"("subjectId");

-- CreateIndex
CREATE INDEX "mcq_subjectId_type_idx" ON "mcq"("subjectId", "type");

-- CreateIndex
CREATE INDEX "mcq_type_idx" ON "mcq"("type");

-- CreateIndex
CREATE INDEX "mcq_difficulty_idx" ON "mcq"("difficulty");

-- CreateIndex
CREATE INDEX "cq_chapterId_idx" ON "cq"("chapterId");

-- CreateIndex
CREATE INDEX "cq_subjectId_idx" ON "cq"("subjectId");

-- CreateIndex
CREATE INDEX "cq_difficulty_idx" ON "cq"("difficulty");

-- CreateIndex
CREATE INDEX "question_attachment_mcqId_idx" ON "question_attachment"("mcqId");

-- CreateIndex
CREATE INDEX "question_attachment_cqId_idx" ON "question_attachment"("cqId");

-- CreateIndex
CREATE INDEX "question_attachment_shortAnswerId_idx" ON "question_attachment"("shortAnswerId");

-- CreateIndex
CREATE UNIQUE INDEX "cq_answer_cqId_key" ON "cq_answer"("cqId");

-- CreateIndex
CREATE INDEX "short_answer_chapterId_idx" ON "short_answer"("chapterId");

-- CreateIndex
CREATE INDEX "short_answer_subjectId_idx" ON "short_answer"("subjectId");

-- CreateIndex
CREATE INDEX "short_answer_difficulty_idx" ON "short_answer"("difficulty");

-- CreateIndex
CREATE INDEX "question_report_entityType_entityId_idx" ON "question_report"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "question_report_status_idx" ON "question_report"("status");

-- AddForeignKey
ALTER TABLE "subject_question_type" ADD CONSTRAINT "subject_question_type_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_question_type" ADD CONSTRAINT "subject_question_type_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq" ADD CONSTRAINT "mcq_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq" ADD CONSTRAINT "mcq_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq" ADD CONSTRAINT "mcq_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attachment" ADD CONSTRAINT "question_attachment_mcqId_fkey" FOREIGN KEY ("mcqId") REFERENCES "mcq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attachment" ADD CONSTRAINT "question_attachment_cqId_fkey" FOREIGN KEY ("cqId") REFERENCES "cq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attachment" ADD CONSTRAINT "question_attachment_shortAnswerId_fkey" FOREIGN KEY ("shortAnswerId") REFERENCES "short_answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq_answer" ADD CONSTRAINT "cq_answer_cqId_fkey" FOREIGN KEY ("cqId") REFERENCES "cq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_answer" ADD CONSTRAINT "short_answer_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_answer" ADD CONSTRAINT "short_answer_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "academic_chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_answer" ADD CONSTRAINT "short_answer_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;
