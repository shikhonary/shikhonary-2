import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@workspace/db/main";
import type { TenantPrismaClient } from "@workspace/db/tenant";
import { notFound, badRequest } from "../../../utils/errors";
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
import { logHistory } from "./helpers/history-logger";

const CATEGORY_TO_BULK_FIELD: Record<string, string> = {
  MCQ: "mcqIds",
  CQ: "cqIds",
  CS: "csIds",
  SA: "shortAnswerIds",
  PBQ: "pbqIds",
  PARAGRAPH: "paragraphIds",
  AMPLIFICATION: "amplificationIds",
  THOUGHT_EXPANSION: "thoughtExpansionIds",
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
  NUMBER_IN_WORDS: "numberInWordsIds",
  JUKTOBORNO: "juktobornoIds",
  EK_KOTHAY_PROKASH: "ekKothayProkashIds",
  MAKE_SENTENCES: "makeSentencesIds",
  OPPOSITE_WORD: "oppositeWordIds",
  GENDER_CHANGE: "genderChangeIds",
  SYNONYM: "synonymIds",
  SADHU_TO_CHOLITO: "sadhuToCholitoIds",
  POD_NIRNOY: "podNirnoyIds",
  VERB_TENSE: "verbTenseIds",
  FORM_FILLUP: "formFillupIds",
  FORM_FILLING: "formFillupIds",
  SHUDDHO_ASHUDDHO: "shuddhoAshuddhoIds",
  DAN_BAM_MILKORON: "danBamMilkoronIds",
  MATH_QUESTION: "mathQuestionIds",
  GRAMMAR_QUESTION: "grammarQuestionIds",
  REARRANGE: "rearrangeIds",
  SEEN_COMPREHENSION_1: "seenComprehensionIds",
  SEEN_COMPREHENSION_2: "seenComprehensionIds",
};

const CATEGORY_TO_SINGLE_FIELD: Record<string, string> = {
  MCQ: "mcqId",
  CQ: "cqId",
  CS: "csId",
  SA: "shortAnswerId",
  PBQ: "pbqId",
  PARAGRAPH: "paragraphId",
  AMPLIFICATION: "amplificationId",
  THOUGHT_EXPANSION: "thoughtExpansionId",
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
  NUMBER_IN_WORDS: "numberInWordsId",
  JUKTOBORNO: "juktobornoId",
  EK_KOTHAY_PROKASH: "ekKothayProkashId",
  MAKE_SENTENCES: "makeSentencesId",
  OPPOSITE_WORD: "oppositeWordId",
  GENDER_CHANGE: "genderChangeId",
  SYNONYM: "synonymId",
  SADHU_TO_CHOLITO: "sadhuToCholitoId",
  POD_NIRNOY: "podNirnoyId",
  VERB_TENSE: "verbTenseId",
  FORM_FILLUP: "formFillupId",
  FORM_FILLING: "formFillupId",
  SHUDDHO_ASHUDDHO: "shuddhoAshuddhoId",
  DAN_BAM_MILKORON: "danBamMilkoronId",
  MATH_QUESTION: "mathQuestionId",
  GRAMMAR_QUESTION: "grammarQuestionId",
  REARRANGE: "rearrangeId",
  SEEN_COMPREHENSION_1: "seenComprehensionId",
  SEEN_COMPREHENSION_2: "seenComprehensionId",
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
  if (paper.status === "Published") {
    throw badRequest("পাবলিশড প্রশ্নপত্রে কোনো প্রশ্ন যুক্ত, পরিবর্তন বা এক্সচেঞ্জ করা যাবে না।");
  }

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
  if (paper.status === "Published") {
    throw badRequest("পাবলিশড প্রশ্নপত্রে কোনো প্রশ্ন যুক্ত, পরিবর্তন বা এক্সচেঞ্জ করা যাবে না।");
  }

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
        { thoughtExpansionId: input.questionPaperQuestionId },
        { letterId: input.questionPaperQuestionId },
        { applicationId: input.questionPaperQuestionId },
        { summaryId: input.questionPaperQuestionId },
        { essenceId: input.questionPaperQuestionId },
        { poemId: input.questionPaperQuestionId },
        { essayId: input.questionPaperQuestionId },
        { newsReportId: input.questionPaperQuestionId },
        { grammarQuestionId: input.questionPaperQuestionId },
        { shortQuestionId: input.questionPaperQuestionId },
        { descriptiveQuestionId: input.questionPaperQuestionId },
        { seenComprehensionId: input.questionPaperQuestionId },
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

  let targetCandidateId = input.newQuestionId;

  // If no newQuestionId was explicitly supplied, find candidate replacement from the same subject/distribution
  if (!targetCandidateId) {
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

    targetCandidateId = candidate?.id;
  }

  if (!targetCandidateId) {
    return {
      ok: false,
      questionPaperId: input.questionPaperId,
      message: "No alternative question found in question bank matching the requirements.",
    };
  }

  // In-place atomic update: keeps the exact same junction record, orderIndex, sectionId, subSectionId, distributionId, and any alternatives!
  const targetCategory = input.questionType || currentCategory;
  const oldField = CATEGORY_TO_SINGLE_FIELD[currentCategory] || "mcqId";
  const newField = CATEGORY_TO_SINGLE_FIELD[targetCategory] || oldField;

  const updateData: Record<string, any> = {};
  if (oldField !== newField) {
    updateData[oldField] = null;
  }
  updateData[newField] = targetCandidateId;

  await tenantDb.questionPaperQuestion.update({
    where: { id: junction.id },
    data: updateData,
  });

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "QUESTION_EXCHANGED",
    actorId,
    changes: {
      junctionId: junction.id,
      oldQuestionId: currentQuestionId,
      newQuestionId: targetCandidateId,
      category: targetCategory,
      orderIndex: junction.orderIndex,
    },
  });

  return {
    ok: true,
    questionPaperId: input.questionPaperId,
    oldQuestionId: currentQuestionId,
    newQuestionId: targetCandidateId,
    category: targetCategory,
    message: `Question successfully exchanged.`,
  };
}
