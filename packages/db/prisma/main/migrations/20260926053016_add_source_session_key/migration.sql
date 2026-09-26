-- AlterTable
ALTER TABLE "amplification" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "application" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "changing_sentence" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "cq" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "cs" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "descriptive_question" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "essay" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "essence" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "fill_in_the_blanks_with_clues" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "gender_change" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "juktoborno" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "letter" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "make_sentences" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "mcq" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "news_report" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "paragraph" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "parts_of_speech" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "pbq" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "poem" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "punctuation" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "right_form_of_verb" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "short_answer" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "short_composition" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "short_question" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "substitution_table" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "summary" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "synonym" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "thought_expansion" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "word_meaning" ADD COLUMN     "session" TEXT,
ADD COLUMN     "source" TEXT;
