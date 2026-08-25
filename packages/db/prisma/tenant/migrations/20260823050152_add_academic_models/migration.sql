-- CreateTable
CREATE TABLE "academic_class" (
    "id" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_subject" (
    "id" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "code" TEXT,
    "group" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "academicYearId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_class_subject" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_class_subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_chapter" (
    "id" TEXT NOT NULL,
    "nameBn" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subjectId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_chapter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "academic_class_isActive_idx" ON "academic_class"("isActive");

-- CreateIndex
CREATE INDEX "academic_class_nameEn_idx" ON "academic_class"("nameEn");

-- CreateIndex
CREATE INDEX "academic_subject_isActive_idx" ON "academic_subject"("isActive");

-- CreateIndex
CREATE INDEX "academic_subject_academicYearId_idx" ON "academic_subject"("academicYearId");

-- CreateIndex
CREATE INDEX "academic_class_subject_classId_idx" ON "academic_class_subject"("classId");

-- CreateIndex
CREATE INDEX "academic_class_subject_subjectId_idx" ON "academic_class_subject"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "academic_class_subject_classId_subjectId_key" ON "academic_class_subject"("classId", "subjectId");

-- CreateIndex
CREATE INDEX "academic_chapter_isActive_idx" ON "academic_chapter"("isActive");

-- CreateIndex
CREATE INDEX "academic_chapter_subjectId_idx" ON "academic_chapter"("subjectId");

-- CreateIndex
CREATE INDEX "academic_chapter_academicYearId_idx" ON "academic_chapter"("academicYearId");

-- AddForeignKey
ALTER TABLE "academic_subject" ADD CONSTRAINT "academic_subject_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_class_subject" ADD CONSTRAINT "academic_class_subject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "academic_class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_class_subject" ADD CONSTRAINT "academic_class_subject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_chapter" ADD CONSTRAINT "academic_chapter_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "academic_subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_chapter" ADD CONSTRAINT "academic_chapter_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "academic_year"("id") ON DELETE CASCADE ON UPDATE CASCADE;
