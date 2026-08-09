-- CreateTable
CREATE TABLE "cq" (
    "id" TEXT NOT NULL,
    "questionA" TEXT NOT NULL,
    "questionB" TEXT NOT NULL,
    "questionC" TEXT NOT NULL,
    "questionD" TEXT,
    "context" TEXT,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "subjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cq_attachment" (
    "id" TEXT NOT NULL,
    "cqId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'image',
    "caption" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cq_attachment_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX "cq_chapterId_idx" ON "cq"("chapterId");

-- CreateIndex
CREATE INDEX "cq_subjectId_idx" ON "cq"("subjectId");

-- CreateIndex
CREATE INDEX "cq_attachment_cqId_idx" ON "cq_attachment"("cqId");

-- CreateIndex
CREATE UNIQUE INDEX "cq_answer_cqId_key" ON "cq_answer"("cqId");

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq" ADD CONSTRAINT "cq_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq_attachment" ADD CONSTRAINT "cq_attachment_cqId_fkey" FOREIGN KEY ("cqId") REFERENCES "cq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq_answer" ADD CONSTRAINT "cq_answer_cqId_fkey" FOREIGN KEY ("cqId") REFERENCES "cq"("id") ON DELETE CASCADE ON UPDATE CASCADE;
