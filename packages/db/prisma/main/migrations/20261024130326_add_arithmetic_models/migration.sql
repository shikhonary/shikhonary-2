-- CreateTable
CREATE TABLE "addition" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "isMath" BOOLEAN NOT NULL DEFAULT true,
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

    CONSTRAINT "addition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtraction" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "isMath" BOOLEAN NOT NULL DEFAULT true,
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

    CONSTRAINT "subtraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multiplication" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "isMath" BOOLEAN NOT NULL DEFAULT true,
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

    CONSTRAINT "multiplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "math_division" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "isMath" BOOLEAN NOT NULL DEFAULT true,
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

    CONSTRAINT "math_division_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "addition_createdById_idx" ON "addition"("createdById");

-- CreateIndex
CREATE INDEX "addition_tenantId_isGlobal_idx" ON "addition"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "addition_questionTypeId_idx" ON "addition"("questionTypeId");

-- CreateIndex
CREATE INDEX "addition_deletedAt_idx" ON "addition"("deletedAt");

-- CreateIndex
CREATE INDEX "addition_academicChapterId_idx" ON "addition"("academicChapterId");

-- CreateIndex
CREATE INDEX "addition_subjectId_idx" ON "addition"("subjectId");

-- CreateIndex
CREATE INDEX "addition_isMath_idx" ON "addition"("isMath");

-- CreateIndex
CREATE INDEX "addition_difficulty_idx" ON "addition"("difficulty");

-- CreateIndex
CREATE INDEX "subtraction_createdById_idx" ON "subtraction"("createdById");

-- CreateIndex
CREATE INDEX "subtraction_tenantId_isGlobal_idx" ON "subtraction"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "subtraction_questionTypeId_idx" ON "subtraction"("questionTypeId");

-- CreateIndex
CREATE INDEX "subtraction_deletedAt_idx" ON "subtraction"("deletedAt");

-- CreateIndex
CREATE INDEX "subtraction_academicChapterId_idx" ON "subtraction"("academicChapterId");

-- CreateIndex
CREATE INDEX "subtraction_subjectId_idx" ON "subtraction"("subjectId");

-- CreateIndex
CREATE INDEX "subtraction_isMath_idx" ON "subtraction"("isMath");

-- CreateIndex
CREATE INDEX "subtraction_difficulty_idx" ON "subtraction"("difficulty");

-- CreateIndex
CREATE INDEX "multiplication_createdById_idx" ON "multiplication"("createdById");

-- CreateIndex
CREATE INDEX "multiplication_tenantId_isGlobal_idx" ON "multiplication"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "multiplication_questionTypeId_idx" ON "multiplication"("questionTypeId");

-- CreateIndex
CREATE INDEX "multiplication_deletedAt_idx" ON "multiplication"("deletedAt");

-- CreateIndex
CREATE INDEX "multiplication_academicChapterId_idx" ON "multiplication"("academicChapterId");

-- CreateIndex
CREATE INDEX "multiplication_subjectId_idx" ON "multiplication"("subjectId");

-- CreateIndex
CREATE INDEX "multiplication_isMath_idx" ON "multiplication"("isMath");

-- CreateIndex
CREATE INDEX "multiplication_difficulty_idx" ON "multiplication"("difficulty");

-- CreateIndex
CREATE INDEX "math_division_createdById_idx" ON "math_division"("createdById");

-- CreateIndex
CREATE INDEX "math_division_tenantId_isGlobal_idx" ON "math_division"("tenantId", "isGlobal");

-- CreateIndex
CREATE INDEX "math_division_questionTypeId_idx" ON "math_division"("questionTypeId");

-- CreateIndex
CREATE INDEX "math_division_deletedAt_idx" ON "math_division"("deletedAt");

-- CreateIndex
CREATE INDEX "math_division_academicChapterId_idx" ON "math_division"("academicChapterId");

-- CreateIndex
CREATE INDEX "math_division_subjectId_idx" ON "math_division"("subjectId");

-- CreateIndex
CREATE INDEX "math_division_isMath_idx" ON "math_division"("isMath");

-- CreateIndex
CREATE INDEX "math_division_difficulty_idx" ON "math_division"("difficulty");

-- AddForeignKey
ALTER TABLE "addition" ADD CONSTRAINT "addition_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addition" ADD CONSTRAINT "addition_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addition" ADD CONSTRAINT "addition_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addition" ADD CONSTRAINT "addition_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addition" ADD CONSTRAINT "addition_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addition" ADD CONSTRAINT "addition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtraction" ADD CONSTRAINT "subtraction_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtraction" ADD CONSTRAINT "subtraction_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtraction" ADD CONSTRAINT "subtraction_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtraction" ADD CONSTRAINT "subtraction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtraction" ADD CONSTRAINT "subtraction_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtraction" ADD CONSTRAINT "subtraction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multiplication" ADD CONSTRAINT "multiplication_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multiplication" ADD CONSTRAINT "multiplication_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multiplication" ADD CONSTRAINT "multiplication_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multiplication" ADD CONSTRAINT "multiplication_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multiplication" ADD CONSTRAINT "multiplication_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multiplication" ADD CONSTRAINT "multiplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "math_division" ADD CONSTRAINT "math_division_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "math_division" ADD CONSTRAINT "math_division_academicChapterId_fkey" FOREIGN KEY ("academicChapterId") REFERENCES "academic_chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "math_division" ADD CONSTRAINT "math_division_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "math_division" ADD CONSTRAINT "math_division_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "math_division" ADD CONSTRAINT "math_division_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "math_division" ADD CONSTRAINT "math_division_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
