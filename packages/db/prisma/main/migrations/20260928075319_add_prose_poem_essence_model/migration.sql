-- CreateTable
CREATE TABLE "poem_essence" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "poemStanza" TEXT,
    "mainTheme" TEXT,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT,
    "session" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "academicChapterId" TEXT,
    "questionTypeId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "poem_essence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prose_essence" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prosePassage" TEXT,
    "mainTheme" TEXT,
    "reference" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT,
    "session" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "popularityCount" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "academicChapterId" TEXT,
    "questionTypeId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "tenantId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "prose_essence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "poem_essence_createdById_idx" ON "poem_essence"("createdById");

-- CreateIndex
CREATE INDEX "poem_essence_tenantId_isGlobal_idx" ON "poem_essence"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "poem_essence_questionTypeId_idx" ON "poem_essence"("questionTypeId");

-- CreateIndex
CREATE INDEX "poem_essence_deletedAt_idx" ON "poem_essence"("deletedAt");

-- CreateIndex
CREATE INDEX "poem_essence_subjectId_idx" ON "poem_essence"("subjectId");

-- CreateIndex
CREATE INDEX "poem_essence_academicChapterId_idx" ON "poem_essence"("academicChapterId");

-- CreateIndex
CREATE INDEX "poem_essence_difficulty_idx" ON "poem_essence"("difficulty");

-- CreateIndex
CREATE INDEX "prose_essence_createdById_idx" ON "prose_essence"("createdById");

-- CreateIndex
CREATE INDEX "prose_essence_tenantId_isGlobal_idx" ON "prose_essence"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "prose_essence_questionTypeId_idx" ON "prose_essence"("questionTypeId");

-- CreateIndex
CREATE INDEX "prose_essence_deletedAt_idx" ON "prose_essence"("deletedAt");

-- CreateIndex
CREATE INDEX "prose_essence_subjectId_idx" ON "prose_essence"("subjectId");

-- CreateIndex
CREATE INDEX "prose_essence_academicChapterId_idx" ON "prose_essence"("academicChapterId");

-- CreateIndex
CREATE INDEX "prose_essence_difficulty_idx" ON "prose_essence"("difficulty");

-- AddForeignKey
ALTER TABLE "poem_essence" ADD CONSTRAINT "poem_essence_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poem_essence" ADD CONSTRAINT "poem_essence_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poem_essence" ADD CONSTRAINT "poem_essence_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poem_essence" ADD CONSTRAINT "poem_essence_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poem_essence" ADD CONSTRAINT "poem_essence_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poem_essence" ADD CONSTRAINT "poem_essence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prose_essence" ADD CONSTRAINT "prose_essence_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prose_essence" ADD CONSTRAINT "prose_essence_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prose_essence" ADD CONSTRAINT "prose_essence_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prose_essence" ADD CONSTRAINT "prose_essence_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prose_essence" ADD CONSTRAINT "prose_essence_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prose_essence" ADD CONSTRAINT "prose_essence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
