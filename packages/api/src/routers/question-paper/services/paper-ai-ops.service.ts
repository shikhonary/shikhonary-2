import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@workspace/db/main";
import type { TenantPrismaClient } from "@workspace/db/tenant";
import { notFound } from "../../../utils/errors";
import type {
  AutoFillDistributionInput,
  ReplaceQuestionInput,
} from "../question-paper.schema";
import {
  bulkAssignQuestions,
  removeQuestionPaperQuestion,
  addQuestionPaperQuestion,
} from "./paper-questions.service";
import { getAvailableQuestions } from "./paper-available.service";

const CATEGORY_TO_BULK_FIELD: Record<string, string> = {
  MCQ: "mcqIds",
  CQ: "cqIds",
  CS: "csIds",
  SA: "shortAnswerIds",
  PBQ: "pbqIds",
  PARAGRAPH: "paragraphIds",
  AMPLIFICATION: "amplificationIds",
  LETTER: "letterIds",
  APPLICATION: "applicationIds",
  SUMMARY: "summaryIds",
  ESSENCE: "essenceIds",
  POEM_ESSENCE: "poemEssenceIds",
  PROSE_ESSENCE: "proseEssenceIds",
  POEM: "poemIds",
  ESSAY: "essayIds",
  NEWS_REPORT: "newsReportIds",
  PARTS_OF_SPEECH: "partsOfSpeechIds",
  RIGHT_FORM_OF_VERBS: "rightFormOfVerbIds",
  CHANGING_SENTENCES: "changingSentenceIds",
  FILL_IN_THE_BLANKS_WITH_CLUES: "fillInTheBlanksWithCluesIds",
  FILL_IN_THE_BLANKS_WITHOUT_CLUES: "fillInTheBlanksWithoutCluesIds",
  SUBSTITUTION_TABLE: "substitutionTableIds",
  PUNCTUATION: "punctuationIds",
  SHORT_COMPOSITION: "shortCompositionIds",
  DESCRIPTIVE_QUESTION: "descriptiveQuestionIds",
  SHORT_QUESTION: "shortQuestionIds",
  MAKE_QUESTION: "makeQuestionIds",
  WORD_MEANING: "wordMeaningIds",
  JUKTOBORNO: "juktobornoIds",
  EK_KOTHAY_PROKASH: "ekKothayProkashIds",
  MAKE_SENTENCES: "makeSentencesIds",
  OPPOSITE_WORD: "oppositeWordIds",
  SYNONYM: "synonymIds",
  SADHU_TO_CHOLITO: "sadhuToCholitoIds",
  POD_NIRNOY: "podNirnoyIds",
  VERB_TENSE: "verbTenseIds",
  FORM_FILLUP: "formFillupIds",
  FORM_FILLING: "formFillupIds",
  SHUDDHO_ASHUDDHO: "shuddhoAshuddhoIds",
  DAN_BAM_MILKORON: "danBamMilkoronIds",
};

const CATEGORY_TO_SINGLE_FIELD: Record<string, string> = {
  MCQ: "mcqId",
  CQ: "cqId",
  CS: "csId",
  SA: "shortAnswerId",
  PBQ: "pbqId",
  PARAGRAPH: "paragraphId",
  AMPLIFICATION: "amplificationId",
  LETTER: "letterId",
  APPLICATION: "applicationId",
  SUMMARY: "summaryId",
  ESSENCE: "essenceId",
  POEM_ESSENCE: "poemEssenceId",
  PROSE_ESSENCE: "proseEssenceId",
  POEM: "poemId",
  ESSAY: "essayId",
  NEWS_REPORT: "newsReportId",
  PARTS_OF_SPEECH: "partsOfSpeechId",
  RIGHT_FORM_OF_VERBS: "rightFormOfVerbId",
  CHANGING_SENTENCES: "changingSentenceId",
  FILL_IN_THE_BLANKS_WITH_CLUES: "fillInTheBlanksWithCluesId",
  FILL_IN_THE_BLANKS_WITHOUT_CLUES: "fillInTheBlanksWithoutCluesId",
  SUBSTITUTION_TABLE: "substitutionTableId",
  PUNCTUATION: "punctuationId",
  SHORT_COMPOSITION: "shortCompositionId",
  DESCRIPTIVE_QUESTION: "descriptiveQuestionId",
  SHORT_QUESTION: "shortQuestionId",
  MAKE_QUESTION: "makeQuestionId",
  WORD_MEANING: "wordMeaningId",
  JUKTOBORNO: "juktobornoId",
  EK_KOTHAY_PROKASH: "ekKothayProkashId",
  MAKE_SENTENCES: "makeSentencesId",
  OPPOSITE_WORD: "oppositeWordId",
  SYNONYM: "synonymId",
  SADHU_TO_CHOLITO: "sadhuToCholitoId",
  POD_NIRNOY: "podNirnoyId",
  VERB_TENSE: "verbTenseId",
  FORM_FILLUP: "formFillupId",
  FORM_FILLING: "formFillupId",
  SHUDDHO_ASHUDDHO: "shuddhoAshuddhoId",
  DAN_BAM_MILKORON: "danBamMilkoronId",
};

/**
 * Server-side auto-fill operation:
 * Automatically selects unassigned questions matching the distribution filters
 * and assigns them without passing question bodies over LLM tokens.
 */
export async function autoFillDistribution(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: AutoFillDistributionInput,
  actorId?: string,
  tenantId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  });
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper");

  const dist = await tenantDb.questionPaperSubjectMarkDistribution.findUnique({
    where: { id: input.distributionId },
    include: {
      paperSubject: true,
      questions: true,
    },
  });
  if (!dist) throw notFound("QuestionPaperSubjectMarkDistribution");

  const currentCount = dist.questions.length;
  const remainingNeeded = Math.max(0, dist.questionCount - currentCount);
  const targetToPick = input.count
    ? Math.min(input.count, remainingNeeded > 0 ? remainingNeeded : input.count)
    : remainingNeeded;

  if (targetToPick <= 0) {
    return {
      ok: true,
      questionPaperId: input.questionPaperId,
      distributionId: input.distributionId,
      addedCount: 0,
      totalAssigned: currentCount,
      targetCount: dist.questionCount,
      message: "This mark distribution is already completely filled.",
    };
  }

  // Query candidate questions from main database
  const availableRes = await getAvailableQuestions(db, tenantDb, {
    subjectId: dist.paperSubject.subjectId,
    questionTypeId: dist.questionTypeId,
    excludePaperId: input.questionPaperId,
    chapterId: input.chapterId,
    difficulty: input.difficulty,
    board: input.board,
    source: input.source,
    limit: 100,
  });

  const unassigned = (availableRes.items || []).filter((item: any) => !item.isAssigned);
  if (unassigned.length === 0) {
    return {
      ok: false,
      questionPaperId: input.questionPaperId,
      distributionId: input.distributionId,
      addedCount: 0,
      totalAssigned: currentCount,
      targetCount: dist.questionCount,
      message: "No unassigned questions found matching the requested criteria.",
    };
  }

  // Select up to targetToPick questions
  const selected = unassigned.slice(0, targetToPick);
  const selectedIds = selected.map((s: any) => s.id);

  const bulkField =
    CATEGORY_TO_BULK_FIELD[availableRes.category] || "mcqIds";

  await bulkAssignQuestions(
    db,
    tenantDb,
    {
      questionPaperId: input.questionPaperId,
      distributionId: input.distributionId,
      [bulkField]: selectedIds,
    } as any,
    actorId,
    tenantId
  );

  return {
    ok: true,
    questionPaperId: input.questionPaperId,
    distributionId: input.distributionId,
    addedCount: selectedIds.length,
    totalAssigned: currentCount + selectedIds.length,
    targetCount: dist.questionCount,
    category: availableRes.category,
    message: `Successfully added ${selectedIds.length} question(s) to ${dist.questionTypeName}.`,
  };
}

/**
 * Server-side question exchange operation:
 * Swaps a question at a specific position with an unassigned matching question.
 */
export async function replaceQuestion(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: ReplaceQuestionInput,
  actorId?: string,
  tenantId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  });
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper");

  // Locate the junction record
  const junction = await tenantDb.questionPaperQuestion.findFirst({
    where: {
      questionPaperId: input.questionPaperId,
      OR: [
        { id: input.questionPaperQuestionId },
        { mcqId: input.questionPaperQuestionId },
        { cqId: input.questionPaperQuestionId },
        { csId: input.questionPaperQuestionId },
        { shortAnswerId: input.questionPaperQuestionId },
        { pbqId: input.questionPaperQuestionId },
        { paragraphId: input.questionPaperQuestionId },
        { amplificationId: input.questionPaperQuestionId },
        { letterId: input.questionPaperQuestionId },
        { applicationId: input.questionPaperQuestionId },
        { summaryId: input.questionPaperQuestionId },
        { essayId: input.questionPaperQuestionId },
      ],
    },
    include: {
      distribution: {
        include: { paperSubject: true },
      },
    },
  });

  if (!junction) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Specified question was not found in this question paper.",
    });
  }

  // Identify current question ID and category
  let currentQuestionId = "";
  let currentCategory = "";

  for (const [category, field] of Object.entries(CATEGORY_TO_SINGLE_FIELD)) {
    const val = (junction as any)[field];
    if (val) {
      currentQuestionId = val;
      currentCategory = category;
      break;
    }
  }

  if (!currentQuestionId || !currentCategory) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Could not determine question category for replacement.",
    });
  }

  // Find candidate replacement from the same subject/distribution
  const availableRes = await getAvailableQuestions(db, tenantDb, {
    subjectId: junction.distribution.paperSubject.subjectId,
    questionTypeId: junction.distribution.questionTypeId,
    excludePaperId: input.questionPaperId,
    chapterId: input.chapterId,
    difficulty: input.difficulty,
    limit: 20,
  });

  const candidate = (availableRes.items || []).find(
    (item: any) => !item.isAssigned && item.id !== currentQuestionId
  );

  if (!candidate) {
    return {
      ok: false,
      questionPaperId: input.questionPaperId,
      message: "No alternative question found in question bank matching the requirements.",
    };
  }

  // 1. Remove the old question
  await removeQuestionPaperQuestion(
    db,
    tenantDb,
    {
      questionPaperId: input.questionPaperId,
      questionId: currentQuestionId,
      questionType: currentCategory as any,
    },
    actorId,
    tenantId
  );

  // 2. Add the candidate in the exact same distribution, section, and orderIndex
  const singleField = CATEGORY_TO_SINGLE_FIELD[currentCategory] || "mcqId";
  await addQuestionPaperQuestion(
    db,
    tenantDb,
    {
      questionPaperId: input.questionPaperId,
      distributionId: junction.distributionId,
      sectionId: junction.sectionId,
      subSectionId: junction.subSectionId,
      orderIndex: junction.orderIndex,
      [singleField]: candidate.id,
    } as any,
    actorId,
    tenantId
  );

  return {
    ok: true,
    questionPaperId: input.questionPaperId,
    oldQuestionId: currentQuestionId,
    newQuestionId: candidate.id,
    category: currentCategory,
    message: `Question successfully exchanged.`,
  };
}
