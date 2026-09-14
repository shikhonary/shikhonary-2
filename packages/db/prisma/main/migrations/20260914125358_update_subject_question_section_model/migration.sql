-- AlterTable
ALTER TABLE "subject_question_section" ALTER COLUMN "nameBn" DROP NOT NULL,
ALTER COLUMN "nameEn" DROP NOT NULL;

-- AlterTable
ALTER TABLE "subject_question_sub_section" ALTER COLUMN "nameBn" DROP NOT NULL,
ALTER COLUMN "nameEn" DROP NOT NULL;
