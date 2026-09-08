import type { PrismaClient } from "@workspace/db/main"
import type { TenantPrismaClient } from "@workspace/db/tenant"
import { notFound } from "../../../utils/errors"
import type {
  AddAlternativeQuestionInput,
  RemoveAlternativeQuestionInput,
  SwapAlternativeQuestionInput,
  UpdateAlternativeQuestionInput,
} from "../question-paper.schema"
import { logHistory } from "./helpers/history-logger"

export async function addAlternativeQuestion(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: AddAlternativeQuestionInput,
  actorId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  })
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper")

  // 1. Fetch the primary question
  const primaryQuestion = await tenantDb.questionPaperQuestion.findUnique({
    where: { id: input.parentQuestionId },
    include: { distribution: true },
  })
  if (!primaryQuestion) throw notFound("Primary Question")
  if (primaryQuestion.parentQuestionId) {
    throw new Error("Cannot add an alternative to another alternative question.")
  }

  // 2. Strict mark validation: Alternative must share exact same mark
  const primaryMark = primaryQuestion.assignedMarks ?? primaryQuestion.distribution?.marksPerQuestion ?? 0

  // 3. Resolve the alternative question in main DB
  const typeFieldMap: Record<string, string> = {
    MCQ: "mcqId",
    CQ: "cqId",
    CS: "csId",
    PBQ: "pbqId",
    SA: "shortAnswerId",
    PARAGRAPH: "paragraphId",
    AMPLIFICATION: "amplificationId",
    LETTER: "letterId",
    APPLICATION: "applicationId",
    SUMMARY: "summaryId",
    ESSENCE: "essenceId",
    NEWS_REPORT: "newsReportId",
    ESSAY: "essayId",
    PARTS_OF_SPEECH: "partsOfSpeechId",
    RIGHT_FORM_OF_VERBS: "rightFormOfVerbId",
    CHANGING_SENTENCES: "changingSentenceId",
    FILL_IN_THE_BLANKS_WITH_CLUES: "fillInTheBlanksWithCluesId",
    SUBSTITUTION_TABLE: "substitutionTableId",
    PUNCTUATION: "punctuationId",
    SHORT_COMPOSITION: "shortCompositionId",
  }

  const fkField = typeFieldMap[input.questionType]
  if (!fkField) throw new Error(`Unsupported question type: ${input.questionType}`)

  let altContent: any = null

  if (input.questionType === "MCQ") {
    altContent = await db.mcq.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "CQ") {
    altContent = await db.cq.findUnique({ where: { id: input.questionId } })
    if (altContent?.totalMarks && primaryMark > 0 && altContent.totalMarks !== primaryMark) {
      throw new Error(`বিকল্প প্রশ্নের মান (${altContent.totalMarks}) মূল প্রশ্নের মানের (${primaryMark}) সমান হতে হবে।`)
    }
  } else if (input.questionType === "CS") {
    altContent = await (db as any).cS.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "PBQ") {
    altContent = await db.pBQ.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "SA") {
    altContent = await db.shortAnswer.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "PARAGRAPH") {
    altContent = await db.paragraph.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "AMPLIFICATION") {
    altContent = await db.amplification.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "LETTER") {
    altContent = await (db as any).letter.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "APPLICATION") {
    altContent = await (db as any).application.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "SUMMARY") {
    altContent = await (db as any).summary.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "ESSENCE") {
    altContent = await (db as any).essence.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "NEWS_REPORT") {
    altContent = await (db as any).newsReport.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "ESSAY") {
    altContent = await (db as any).essay.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "PARTS_OF_SPEECH") {
    altContent = await db.partsOfSpeech.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "RIGHT_FORM_OF_VERBS") {
    altContent = await (db as any).rightFormOfVerb.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "CHANGING_SENTENCES") {
    altContent = await (db as any).changingSentence.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "FILL_IN_THE_BLANKS_WITH_CLUES") {
    altContent = await db.fillInTheBlanksWithClues.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "SUBSTITUTION_TABLE") {
    altContent = await db.substitutionTable.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "PUNCTUATION") {
    altContent = await (db as any).punctuation.findUnique({ where: { id: input.questionId } })
  } else if (input.questionType === "SHORT_COMPOSITION") {
    altContent = await (db as any).shortComposition.findUnique({ where: { id: input.questionId } })
  }
  if (!altContent) throw notFound(input.questionType)

  // 4. Verify question is not already added to this paper
  const existingInPaper = await tenantDb.questionPaperQuestion.findFirst({
    where: {
      questionPaperId: input.questionPaperId,
      [fkField]: input.questionId,
    },
  })
  if (existingInPaper) {
    throw new Error("এই প্রশ্নটি ইতিমধ্যে এই প্রশ্নপত্রে যোগ করা আছে। অনুগ্রহ করে অন্য কোনো প্রশ্ন নির্বাচন করুন।")
  }

  // 5. Find highest orOrder
  const existingAlternatives = await tenantDb.questionPaperQuestion.findMany({
    where: { parentQuestionId: input.parentQuestionId },
    orderBy: { orOrder: "desc" },
    take: 1,
    select: { orOrder: true },
  })
  const nextOrOrder = (existingAlternatives[0]?.orOrder ?? 0) + 1

  const contentSnapshot = paper.status === "Published" ? JSON.parse(JSON.stringify(altContent)) : null

  // 6. Resolve matching distribution for alternative question type in this paper
  let targetDistributionId = input.distributionId

  if (altContent.questionTypeId) {
    let isMatching = false
    if (targetDistributionId) {
      const dist = await tenantDb.questionPaperSubjectMarkDistribution.findUnique({
        where: { id: targetDistributionId },
        select: { questionTypeId: true },
      })
      if (dist && dist.questionTypeId === altContent.questionTypeId) {
        isMatching = true
      }
    }

    if (!isMatching) {
      const matchingDist = await tenantDb.questionPaperSubjectMarkDistribution.findFirst({
        where: {
          questionTypeId: altContent.questionTypeId,
          paperSubject: { questionPaperId: input.questionPaperId },
        },
        select: { id: true },
      })
      if (matchingDist) {
        targetDistributionId = matchingDist.id
      }
    }
  }

  if (!targetDistributionId) {
    targetDistributionId = primaryQuestion.distributionId
  }

  // 7. Create the alternative row
  const alternativeQuestion = await tenantDb.questionPaperQuestion.create({
    data: {
      questionPaperId: input.questionPaperId,
      parentQuestionId: input.parentQuestionId,
      [fkField]: input.questionId,
      distributionId: targetDistributionId,
      sectionId: primaryQuestion.sectionId,
      subSectionId: primaryQuestion.subSectionId,
      orderIndex: primaryQuestion.orderIndex,
      assignedMarks: primaryMark, // Strictly same marks as primary
      orLabel: input.orLabel || "অথবা",
      orOrder: nextOrOrder,
      contentSnapshot,
    },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "QUESTION_ADDED",
    actorId,
    changes: {
      parentQuestionId: input.parentQuestionId,
      alternativeQuestionId: alternativeQuestion.id,
      orLabel: input.orLabel,
    },
  })

  return alternativeQuestion
}

export async function removeAlternativeQuestion(
  tenantDb: TenantPrismaClient,
  input: RemoveAlternativeQuestionInput,
  actorId?: string
) {
  const altQuestion = await tenantDb.questionPaperQuestion.findFirst({
    where: {
      id: input.alternativeQuestionId,
      questionPaperId: input.questionPaperId,
      parentQuestionId: { not: null },
    },
  })
  if (!altQuestion) throw notFound("Alternative Question")

  await tenantDb.questionPaperQuestion.delete({
    where: { id: altQuestion.id },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "QUESTION_REMOVED",
    actorId,
    changes: { alternativeQuestionId: altQuestion.id },
  })

  return { success: true }
}

export async function swapAlternativeQuestion(
  tenantDb: TenantPrismaClient,
  input: SwapAlternativeQuestionInput,
  actorId?: string
) {
  const primary = await tenantDb.questionPaperQuestion.findUnique({
    where: { id: input.parentQuestionId },
  })
  const alt = await tenantDb.questionPaperQuestion.findUnique({
    where: { id: input.alternativeQuestionId },
  })
  if (!primary || !alt) throw notFound("Question")

  const fkFields = [
    "mcqId", "cqId", "csId", "pbqId", "shortAnswerId", "paragraphId", "amplificationId",
    "letterId", "applicationId", "summaryId", "essenceId", "essayId", "newsReportId", "partsOfSpeechId", "rightFormOfVerbId", "changingSentenceId", "fillInTheBlanksWithCluesId", "substitutionTableId", "punctuationId", "shortCompositionId"
  ] as const

  const questionFields = [
    ...fkFields,
    "contentSnapshot", "overrides", "assignedMarks"
  ] as const

  const primaryData: any = {}
  const altData: any = {}

  for (const f of questionFields) {
    primaryData[f] = (alt as any)[f]
    altData[f] = (primary as any)[f]
  }

  const nullFks: any = {}
  for (const f of fkFields) {
    nullFks[f] = null
  }

  await tenantDb.$transaction(async (tx) => {
    // 1. Temporarily clear foreign keys on alt to break unique constraint cycle
    await tx.questionPaperQuestion.update({
      where: { id: alt.id },
      data: nullFks,
    })

    // 2. Set primary's question data to alt's data
    await tx.questionPaperQuestion.update({
      where: { id: primary.id },
      data: primaryData,
    })

    // 3. Set alt's question data to primary's data
    await tx.questionPaperQuestion.update({
      where: { id: alt.id },
      data: altData,
    })
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "QUESTION_REORDERED",
    actorId,
    changes: { primaryId: primary.id, alternativeId: alt.id, swap: true },
  })

  return { success: true }
}

export async function updateAlternativeQuestion(
  tenantDb: TenantPrismaClient,
  input: UpdateAlternativeQuestionInput,
  actorId?: string
) {
  const altQuestion = await tenantDb.questionPaperQuestion.findFirst({
    where: {
      id: input.alternativeQuestionId,
      questionPaperId: input.questionPaperId,
    },
  })
  if (!altQuestion) throw notFound("Alternative Question")

  const updated = await tenantDb.questionPaperQuestion.update({
    where: { id: altQuestion.id },
    data: {
      orLabel: input.orLabel ?? altQuestion.orLabel,
    },
  })

  return updated
}
