import type { PrismaClient } from "@workspace/db/main"
import type { TenantPrismaClient } from "@workspace/db/tenant"
import { notFound } from "../../../utils/errors"
import type {
  AddQuestionPaperQuestionInput,
  RemoveQuestionPaperQuestionInput,
  ReorderQuestionPaperQuestionsInput,
  BulkAssignQuestionsInput,
  BulkRemoveQuestionsInput,
} from "../question-paper.schema"
import { logHistory } from "./helpers/history-logger"
import {
  chargeTenantCredits,
  refundTenantCredits,
  getQuestionTypeCreditCost,
  getQuestionTypesCreditCosts,
} from "./helpers/credit-charge"

export async function addQuestionPaperQuestion(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: AddQuestionPaperQuestionInput,
  actorId?: string,
  tenantId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  })
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper")

  const idsSet = [
    input.mcqId,
    input.cqId,
    input.shortAnswerId,
    input.csId,
    input.pbqId,
    input.paragraphId,
    input.amplificationId,
    input.letterId,
    input.applicationId,
    input.summaryId,
    input.essenceId,
    input.poemEssenceId,
    input.proseEssenceId,
    input.poemId,
    input.essayId,
    input.newsReportId,
    input.partsOfSpeechId,
    input.rightFormOfVerbId,
    input.changingSentenceId,
    input.fillInTheBlanksWithCluesId,
    input.fillInTheBlanksWithoutCluesId,
    input.substitutionTableId,
    input.punctuationId,
    input.shortCompositionId,
    input.descriptiveQuestionId,
    input.shortQuestionId,
    input.makeQuestionId,
    input.wordMeaningId,
    input.makeSentencesId,
    input.oppositeWordId,
    input.juktobornoId,
    input.ekKothayProkashId,
    input.synonymId,
    input.sadhuToCholitoId,
    input.podNirnoyId,
    input.verbTenseId,
    input.formFillupId,
  ].filter(Boolean)

  if (idsSet.length !== 1) {
    throw new Error("Exactly one question type ID must be specified")
  }

  let contentSnapshot: any = null
  let questionLabel = ""
  let resolvedQuestionTypeId: string | null = null

  if (input.mcqId) {
    const item = await db.mcq.findUnique({ where: { id: input.mcqId } })
    if (!item) throw notFound("Mcq")
    resolvedQuestionTypeId = item.questionTypeId ?? null
    questionLabel = "MCQ: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.cqId) {
    const item = await db.cq.findUnique({ where: { id: input.cqId } })
    if (!item) throw notFound("Cq")
    resolvedQuestionTypeId = item.questionTypeId ?? null
    questionLabel = "CQ: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.shortAnswerId) {
    const item = await db.shortAnswer.findUnique({ where: { id: input.shortAnswerId } })
    if (!item) throw notFound("ShortAnswer")
    resolvedQuestionTypeId = item.questionTypeId ?? null
    questionLabel = "ShortAnswer: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.csId) {
    const item = await (db as any).cS.findUnique({ where: { id: input.csId } })
    if (!item) throw notFound("CS")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "CS: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.pbqId) {
    const item = await db.pBQ.findUnique({ where: { id: input.pbqId } })
    if (!item) throw notFound("PBQ")
    resolvedQuestionTypeId = item.questionTypeId ?? null
    questionLabel = "PBQ: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.paragraphId) {
    const item = await db.paragraph.findUnique({ where: { id: input.paragraphId } })
    if (!item) throw notFound("Paragraph")
    resolvedQuestionTypeId = item.questionTypeId ?? null
    questionLabel = "Paragraph: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.amplificationId) {
    const item = await db.amplification.findUnique({ where: { id: input.amplificationId } })
    if (!item) throw notFound("Amplification")
    resolvedQuestionTypeId = item.questionTypeId ?? null
    questionLabel = "Amplification: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.letterId) {
    const item = await (db as any).letter.findUnique({ where: { id: input.letterId } })
    if (!item) throw notFound("Letter")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "Letter: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.applicationId) {
    const item = await (db as any).application.findUnique({ where: { id: input.applicationId } })
    if (!item) throw notFound("Application")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "Application: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.summaryId) {
    const item = await (db as any).summary.findUnique({ where: { id: input.summaryId } })
    if (!item) throw notFound("Summary")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "Summary: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.essenceId) {
    const item = await (db as any).essence.findUnique({ where: { id: input.essenceId } })
    if (!item) throw notFound("Essence")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "Essence: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.poemEssenceId) {
    const item = await (db as any).poemEssence.findUnique({ where: { id: input.poemEssenceId } })
    if (!item) throw notFound("PoemEssence")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "PoemEssence: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.proseEssenceId) {
    const item = await (db as any).proseEssence.findUnique({ where: { id: input.proseEssenceId } })
    if (!item) throw notFound("ProseEssence")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "ProseEssence: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.poemId) {
    const item = await (db as any).poem.findUnique({ where: { id: input.poemId } })
    if (!item) throw notFound("Poem")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "Poem: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.essayId) {
    const item = await (db as any).essay.findUnique({ where: { id: input.essayId } })
    if (!item) throw notFound("Essay")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "Essay: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.newsReportId) {
    const item = await (db as any).newsReport.findUnique({ where: { id: input.newsReportId } })
    if (!item) throw notFound("NewsReport")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "NewsReport: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.partsOfSpeechId) {
    const item = await db.partsOfSpeech.findUnique({ where: { id: input.partsOfSpeechId } })
    if (!item) throw notFound("PartsOfSpeech")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "PartsOfSpeech: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.rightFormOfVerbId) {
    const item = await (db as any).rightFormOfVerb.findUnique({ where: { id: input.rightFormOfVerbId } })
    if (!item) throw notFound("RightFormOfVerb")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "RightFormOfVerb: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.changingSentenceId) {
    const item = await (db as any).changingSentence.findUnique({ where: { id: input.changingSentenceId } })
    if (!item) throw notFound("ChangingSentence")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "ChangingSentence: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.fillInTheBlanksWithCluesId) {
    const item = await db.fillInTheBlanksWithClues.findUnique({ where: { id: input.fillInTheBlanksWithCluesId } })
    if (!item) throw notFound("FillInTheBlanksWithClues")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "FillInTheBlanksWithClues: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.fillInTheBlanksWithoutCluesId) {
    const item = await db.fillInTheBlanksWithoutClues.findUnique({ where: { id: input.fillInTheBlanksWithoutCluesId } })
    if (!item) throw notFound("FillInTheBlanksWithoutClues")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "FillInTheBlanksWithoutClues: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.substitutionTableId) {
    const item = await db.substitutionTable.findUnique({ where: { id: input.substitutionTableId } })
    if (!item) throw notFound("SubstitutionTable")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "SubstitutionTable: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.punctuationId) {
    const item = await (db as any).punctuation.findUnique({ where: { id: input.punctuationId } })
    if (!item) throw notFound("Punctuation")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "Punctuation: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.shortCompositionId) {
    const item = await (db as any).shortComposition.findUnique({ where: { id: input.shortCompositionId } })
    if (!item) throw notFound("ShortComposition")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "ShortComposition: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.descriptiveQuestionId) {
    const item = await (db as any).descriptiveQuestion.findUnique({ where: { id: input.descriptiveQuestionId } })
    if (!item) throw notFound("DescriptiveQuestion")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "DescriptiveQuestion: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.shortQuestionId) {
    const item = await (db as any).shortQuestion.findUnique({ where: { id: input.shortQuestionId } })
    if (!item) throw notFound("ShortQuestion")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "ShortQuestion: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.makeQuestionId) {
    const item = await (db as any).makeQuestion.findUnique({ where: { id: input.makeQuestionId } })
    if (!item) throw notFound("MakeQuestion")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "MakeQuestion: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.wordMeaningId) {
    const item = await (db as any).wordMeaning.findUnique({ where: { id: input.wordMeaningId } })
    if (!item) throw notFound("WordMeaning")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "WordMeaning: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.juktobornoId) {
    const item = await (db as any).juktoborno.findUnique({ where: { id: input.juktobornoId } })
    if (!item) throw notFound("Juktoborno")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "Juktoborno: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.ekKothayProkashId) {
    const item = await (db as any).ekKothayProkash.findUnique({ where: { id: input.ekKothayProkashId } })
    if (!item) throw notFound("EkKothayProkash")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "EkKothayProkash: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.makeSentencesId) {
    const item = await (db as any).makeSentences.findUnique({ where: { id: input.makeSentencesId } })
    if (!item) throw notFound("MakeSentences")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "MakeSentences: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.oppositeWordId) {
    const item = await (db as any).oppositeWord.findUnique({ where: { id: input.oppositeWordId } })
    if (!item) throw notFound("OppositeWord")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "OppositeWord: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.synonymId) {
    const item = await (db as any).synonym.findUnique({ where: { id: input.synonymId } })
    if (!item) throw notFound("Synonym")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "Synonym: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.sadhuToCholitoId) {
    const item = await (db as any).sadhuToCholito.findUnique({ where: { id: input.sadhuToCholitoId } })
    if (!item) throw notFound("SadhuToCholito")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "SadhuToCholito: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.podNirnoyId) {
    const item = await (db as any).podNirnoy.findUnique({ where: { id: input.podNirnoyId } })
    if (!item) throw notFound("PodNirnoy")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "PodNirnoy: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.verbTenseId) {
    const item = await (db as any).verbTense.findUnique({ where: { id: input.verbTenseId } })
    if (!item) throw notFound("VerbTense")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "VerbTense: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.formFillupId) {
    const item = await (db as any).formFillup.findUnique({ where: { id: input.formFillupId } })
    if (!item) throw notFound("FormFillup")
    resolvedQuestionTypeId = (item as any).questionTypeId ?? null
    questionLabel = "FormFillup: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  }

  const dist = await tenantDb.questionPaperSubjectMarkDistribution.findUnique({
    where: { id: input.distributionId },
  })

  // Determine credit cost and charge tenant if tenantId is provided
  const finalQuestionTypeId = resolvedQuestionTypeId ?? dist?.questionTypeId ?? null
  const creditCost = await getQuestionTypeCreditCost(db, finalQuestionTypeId)

  if (tenantId && creditCost > 0) {
    await chargeTenantCredits(db, {
      tenantId,
      amount: creditCost,
      description: `Question added to paper (${paper.title}): ${questionLabel}`,
      metadata: {
        questionPaperId: input.questionPaperId,
        questionLabel,
        questionTypeId: finalQuestionTypeId,
        creditCost,
      },
    })
  }

  const finalSectionId = input.sectionId ?? dist?.sectionId ?? null
  const finalSubSectionId = input.subSectionId ?? null

  const paperQuestion = await tenantDb.questionPaperQuestion.create({
    data: {
      questionPaperId: input.questionPaperId,
      mcqId: input.mcqId,
      cqId: input.cqId,
      shortAnswerId: input.shortAnswerId,
      csId: input.csId,
      pbqId: input.pbqId,
      paragraphId: input.paragraphId,
      amplificationId: input.amplificationId,
      letterId: input.letterId,
      applicationId: input.applicationId,
      summaryId: input.summaryId,
      essenceId: input.essenceId,
      poemEssenceId: input.poemEssenceId,
      proseEssenceId: input.proseEssenceId,
      poemId: input.poemId,
      essayId: input.essayId,
      newsReportId: input.newsReportId,
      partsOfSpeechId: input.partsOfSpeechId,
      rightFormOfVerbId: input.rightFormOfVerbId,
      changingSentenceId: input.changingSentenceId,
      fillInTheBlanksWithCluesId: input.fillInTheBlanksWithCluesId,
      fillInTheBlanksWithoutCluesId: input.fillInTheBlanksWithoutCluesId,
      substitutionTableId: input.substitutionTableId,
      punctuationId: input.punctuationId,
      shortCompositionId: input.shortCompositionId,
      descriptiveQuestionId: input.descriptiveQuestionId,
      shortQuestionId: input.shortQuestionId,
      makeQuestionId: input.makeQuestionId,
      wordMeaningId: input.wordMeaningId,
      juktobornoId: input.juktobornoId,
      ekKothayProkashId: input.ekKothayProkashId,
      makeSentencesId: input.makeSentencesId,
      oppositeWordId: input.oppositeWordId,
      synonymId: input.synonymId,
      sadhuToCholitoId: input.sadhuToCholitoId,
      podNirnoyId: input.podNirnoyId,
      verbTenseId: input.verbTenseId,
      formFillupId: input.formFillupId,
      distributionId: input.distributionId,
      sectionId: finalSectionId,
      subSectionId: finalSubSectionId,
      orderIndex: input.orderIndex,
      assignedMarks: input.assignedMarks,
      overrides: input.overrides ?? {},
      addedBy: actorId,
      contentSnapshot,
    },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "QUESTION_ADDED",
    actorId,
    changes: { questionId: paperQuestion.id, label: questionLabel, distributionId: input.distributionId, creditCost },
  })

  return paperQuestion
}

export async function removeQuestionPaperQuestion(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: RemoveQuestionPaperQuestionInput,
  actorId?: string,
  tenantId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  })
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper")

  const typeFieldMap: Record<string, string> = {
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
  }

  const field = typeFieldMap[input.questionType]
  const where: any = {
    questionPaperId: input.questionPaperId,
    OR: [
      { id: input.questionId },
      ...(field ? [{ [field]: input.questionId }] : []),
    ],
  }

  const existing = await tenantDb.questionPaperQuestion.findFirst({ where })
  if (!existing) throw notFound("QuestionPaperQuestion")

  let refundAmount = 0
  if (tenantId) {
    const dist = await tenantDb.questionPaperSubjectMarkDistribution.findUnique({
      where: { id: existing.distributionId },
      select: { questionTypeId: true },
    })
    refundAmount = await getQuestionTypeCreditCost(db, dist?.questionTypeId)
  }

  await tenantDb.questionPaperQuestion.delete({
    where: { id: existing.id },
  })

  if (tenantId && refundAmount > 0) {
    await refundTenantCredits(db, {
      tenantId,
      amount: refundAmount,
      description: `Refund for removed ${input.questionType} question from paper (${paper.title})`,
      metadata: {
        questionPaperId: input.questionPaperId,
        questionId: input.questionId,
        questionType: input.questionType,
        refundAmount,
      },
    })
  }

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "QUESTION_REMOVED",
    actorId,
    changes: { questionId: existing.id, type: input.questionType, refundAmount },
  })

  return { success: true }
}

export async function reorderQuestionPaperQuestions(
  tenantDb: TenantPrismaClient,
  input: ReorderQuestionPaperQuestionsInput,
  actorId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  })
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper")

  const updates = input.questionOrders.map((q) =>
    tenantDb.questionPaperQuestion.update({
      where: { id: q.id },
      data: { orderIndex: q.orderIndex },
    })
  )

  await tenantDb.$transaction(updates)

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "QUESTION_REORDERED",
    actorId,
    changes: { count: input.questionOrders.length },
  })

  return { success: true }
}

export async function bulkAssignQuestions(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: BulkAssignQuestionsInput,
  actorId?: string,
  tenantId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  })
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper")

  const dist = await tenantDb.questionPaperSubjectMarkDistribution.findUnique({
    where: { id: input.distributionId },
  })
  if (!dist) throw notFound("QuestionPaperSubjectMarkDistribution")

  const finalSectionId = input.sectionId ?? dist.sectionId ?? null
  const finalSubSectionId = input.subSectionId ?? null

  const highest = await tenantDb.questionPaperQuestion.findFirst({
    where: { questionPaperId: input.questionPaperId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  })
  let nextOrder = (highest?.orderIndex ?? -1) + 1

  const recordsToCreate: any[] = []

  if (input.mcqIds && input.mcqIds.length > 0) {
    for (const mcqId of input.mcqIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        mcqId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.cqIds && input.cqIds.length > 0) {
    for (const cqId of input.cqIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        cqId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.csIds && input.csIds.length > 0) {
    for (const csId of input.csIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        csId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.pbqIds && input.pbqIds.length > 0) {
    for (const pbqId of input.pbqIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        pbqId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.shortAnswerIds && input.shortAnswerIds.length > 0) {
    for (const shortAnswerId of input.shortAnswerIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        shortAnswerId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.paragraphIds && input.paragraphIds.length > 0) {
    for (const paragraphId of input.paragraphIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        paragraphId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.amplificationIds && input.amplificationIds.length > 0) {
    for (const amplificationId of input.amplificationIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        amplificationId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.letterIds && input.letterIds.length > 0) {
    for (const letterId of input.letterIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        letterId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.applicationIds && input.applicationIds.length > 0) {
    for (const applicationId of input.applicationIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        applicationId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.summaryIds && input.summaryIds.length > 0) {
    for (const summaryId of input.summaryIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        summaryId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.essenceIds && input.essenceIds.length > 0) {
    for (const essenceId of input.essenceIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        essenceId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.poemEssenceIds && input.poemEssenceIds.length > 0) {
    for (const poemEssenceId of input.poemEssenceIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        poemEssenceId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.proseEssenceIds && input.proseEssenceIds.length > 0) {
    for (const proseEssenceId of input.proseEssenceIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        proseEssenceId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.poemIds && input.poemIds.length > 0) {
    for (const poemId of input.poemIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        poemId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.essayIds && input.essayIds.length > 0) {
    for (const essayId of input.essayIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        essayId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.newsReportIds && input.newsReportIds.length > 0) {
    for (const newsReportId of input.newsReportIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        newsReportId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.partsOfSpeechIds && input.partsOfSpeechIds.length > 0) {
    for (const partsOfSpeechId of input.partsOfSpeechIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        partsOfSpeechId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.rightFormOfVerbIds && input.rightFormOfVerbIds.length > 0) {
    for (const rightFormOfVerbId of input.rightFormOfVerbIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        rightFormOfVerbId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.changingSentenceIds && input.changingSentenceIds.length > 0) {
    for (const changingSentenceId of input.changingSentenceIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        changingSentenceId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.fillInTheBlanksWithCluesIds && input.fillInTheBlanksWithCluesIds.length > 0) {
    for (const fillInTheBlanksWithCluesId of input.fillInTheBlanksWithCluesIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        fillInTheBlanksWithCluesId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.fillInTheBlanksWithoutCluesIds && input.fillInTheBlanksWithoutCluesIds.length > 0) {
    for (const fillInTheBlanksWithoutCluesId of input.fillInTheBlanksWithoutCluesIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        fillInTheBlanksWithoutCluesId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.substitutionTableIds && input.substitutionTableIds.length > 0) {
    for (const substitutionTableId of input.substitutionTableIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        substitutionTableId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.punctuationIds && input.punctuationIds.length > 0) {
    for (const punctuationId of input.punctuationIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        punctuationId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.shortCompositionIds && input.shortCompositionIds.length > 0) {
    for (const shortCompositionId of input.shortCompositionIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        shortCompositionId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.descriptiveQuestionIds && input.descriptiveQuestionIds.length > 0) {
    for (const descriptiveQuestionId of input.descriptiveQuestionIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        descriptiveQuestionId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.shortQuestionIds && input.shortQuestionIds.length > 0) {
    for (const shortQuestionId of input.shortQuestionIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        shortQuestionId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.makeQuestionIds && input.makeQuestionIds.length > 0) {
    for (const makeQuestionId of input.makeQuestionIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        makeQuestionId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.wordMeaningIds && input.wordMeaningIds.length > 0) {
    for (const wordMeaningId of input.wordMeaningIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        wordMeaningId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.juktobornoIds && input.juktobornoIds.length > 0) {
    for (const juktobornoId of input.juktobornoIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        juktobornoId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.makeSentencesIds && input.makeSentencesIds.length > 0) {
    for (const makeSentencesId of input.makeSentencesIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        makeSentencesId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.oppositeWordIds && input.oppositeWordIds.length > 0) {
    for (const oppositeWordId of input.oppositeWordIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        oppositeWordId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.ekKothayProkashIds && input.ekKothayProkashIds.length > 0) {
    for (const ekKothayProkashId of input.ekKothayProkashIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        ekKothayProkashId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.synonymIds && input.synonymIds.length > 0) {
    for (const synonymId of input.synonymIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        synonymId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.sadhuToCholitoIds && input.sadhuToCholitoIds.length > 0) {
    for (const sadhuToCholitoId of input.sadhuToCholitoIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        sadhuToCholitoId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.podNirnoyIds && input.podNirnoyIds.length > 0) {
    for (const podNirnoyId of input.podNirnoyIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        podNirnoyId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.verbTenseIds && input.verbTenseIds.length > 0) {
    for (const verbTenseId of input.verbTenseIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        verbTenseId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (input.formFillupIds && input.formFillupIds.length > 0) {
    for (const formFillupId of input.formFillupIds) {
      recordsToCreate.push({
        questionPaperId: input.questionPaperId,
        formFillupId,
        distributionId: input.distributionId,
        sectionId: finalSectionId,
        subSectionId: finalSubSectionId,
        orderIndex: nextOrder++,
      })
    }
  }

  if (recordsToCreate.length === 0) {
    return { success: true, count: 0 }
  }

  let creditCostPerItem = 0
  let totalCredits = 0

  if (tenantId) {
    creditCostPerItem = await getQuestionTypeCreditCost(db, dist.questionTypeId)
    totalCredits = recordsToCreate.length * creditCostPerItem

    if (totalCredits > 0) {
      await chargeTenantCredits(db, {
        tenantId,
        amount: totalCredits,
        description: `Bulk added ${recordsToCreate.length} question(s) to paper (${paper.title})`,
        metadata: {
          questionPaperId: input.questionPaperId,
          distributionId: input.distributionId,
          questionTypeId: dist.questionTypeId,
          count: recordsToCreate.length,
          creditCostPerItem,
          totalCredits,
        },
      })
    }
  }

  for (const record of recordsToCreate) {
    if (paper.status === "Published") {
      if (record.mcqId) {
        record.contentSnapshot = (await db.mcq.findUnique({ where: { id: record.mcqId } })) as any
      } else if (record.cqId) {
        record.contentSnapshot = (await db.cq.findUnique({ where: { id: record.cqId } })) as any
      } else if (record.csId) {
        record.contentSnapshot = (await (db as any).cS.findUnique({ where: { id: record.csId } })) as any
      } else if (record.pbqId) {
        record.contentSnapshot = (await db.pBQ.findUnique({ where: { id: record.pbqId } })) as any
      } else if (record.shortAnswerId) {
        record.contentSnapshot = (await db.shortAnswer.findUnique({ where: { id: record.shortAnswerId } })) as any
      } else if (record.paragraphId) {
        record.contentSnapshot = (await db.paragraph.findUnique({ where: { id: record.paragraphId } })) as any
      } else if (record.amplificationId) {
        record.contentSnapshot = (await db.amplification.findUnique({ where: { id: record.amplificationId } })) as any
      } else if (record.letterId) {
        record.contentSnapshot = (await (db as any).letter.findUnique({ where: { id: record.letterId } })) as any
      } else if (record.applicationId) {
        record.contentSnapshot = (await (db as any).application.findUnique({ where: { id: record.applicationId } })) as any
      } else if (record.summaryId) {
        record.contentSnapshot = (await (db as any).summary.findUnique({ where: { id: record.summaryId } })) as any
      } else if (record.essenceId) {
        record.contentSnapshot = (await (db as any).essence.findUnique({ where: { id: record.essenceId } })) as any
      } else if (record.poemEssenceId) {
        record.contentSnapshot = (await (db as any).poemEssence.findUnique({ where: { id: record.poemEssenceId } })) as any
      } else if (record.proseEssenceId) {
        record.contentSnapshot = (await (db as any).proseEssence.findUnique({ where: { id: record.proseEssenceId } })) as any
      } else if (record.poemId) {
        record.contentSnapshot = (await (db as any).poem.findUnique({ where: { id: record.poemId } })) as any
      } else if (record.essayId) {
        record.contentSnapshot = (await (db as any).essay.findUnique({ where: { id: record.essayId } })) as any
      } else if (record.newsReportId) {
        record.contentSnapshot = (await (db as any).newsReport.findUnique({ where: { id: record.newsReportId } })) as any
      } else if (record.partsOfSpeechId) {
        record.contentSnapshot = (await (db as any).partsOfSpeech.findUnique({ where: { id: record.partsOfSpeechId } })) as any
      } else if (record.rightFormOfVerbId) {
        record.contentSnapshot = (await (db as any).rightFormOfVerb.findUnique({ where: { id: record.rightFormOfVerbId } })) as any
      } else if (record.changingSentenceId) {
        record.contentSnapshot = (await (db as any).changingSentence.findUnique({ where: { id: record.changingSentenceId } })) as any
      } else if (record.fillInTheBlanksWithCluesId) {
        record.contentSnapshot = (await (db as any).fillInTheBlanksWithClues.findUnique({ where: { id: record.fillInTheBlanksWithCluesId } })) as any
      } else if (record.fillInTheBlanksWithoutCluesId) {
        record.contentSnapshot = (await (db as any).fillInTheBlanksWithoutClues.findUnique({ where: { id: record.fillInTheBlanksWithoutCluesId } })) as any
      } else if (record.substitutionTableId) {
        record.contentSnapshot = (await (db as any).substitutionTable.findUnique({ where: { id: record.substitutionTableId } })) as any
      } else if (record.punctuationId) {
        record.contentSnapshot = (await (db as any).punctuation.findUnique({ where: { id: record.punctuationId } })) as any
      } else if (record.shortCompositionId) {
        record.contentSnapshot = (await (db as any).shortComposition.findUnique({ where: { id: record.shortCompositionId } })) as any
      } else if (record.descriptiveQuestionId) {
        record.contentSnapshot = (await (db as any).descriptiveQuestion.findUnique({ where: { id: record.descriptiveQuestionId } })) as any
      } else if (record.shortQuestionId) {
        record.contentSnapshot = (await db.shortQuestion.findUnique({ where: { id: record.shortQuestionId } })) as any
      } else if (record.makeQuestionId) {
        record.contentSnapshot = (await (db as any).makeQuestion.findUnique({ where: { id: record.makeQuestionId } })) as any
      } else if (record.wordMeaningId) {
        record.contentSnapshot = (await (db as any).wordMeaning.findUnique({ where: { id: record.wordMeaningId } })) as any
      } else if (record.juktobornoId) {
        record.contentSnapshot = (await (db as any).juktoborno.findUnique({ where: { id: record.juktobornoId } })) as any
      } else if (record.ekKothayProkashId) {
        record.contentSnapshot = (await (db as any).ekKothayProkash.findUnique({ where: { id: record.ekKothayProkashId } })) as any
      } else if (record.makeSentencesId) {
        record.contentSnapshot = (await (db as any).makeSentences.findUnique({ where: { id: record.makeSentencesId } })) as any
      } else if (record.oppositeWordId) {
        record.contentSnapshot = (await (db as any).oppositeWord.findUnique({ where: { id: record.oppositeWordId } })) as any
      } else if (record.synonymId) {
        record.contentSnapshot = (await (db as any).synonym.findUnique({ where: { id: record.synonymId } })) as any
      } else if (record.sadhuToCholitoId) {
        record.contentSnapshot = (await (db as any).sadhuToCholito.findUnique({ where: { id: record.sadhuToCholitoId } })) as any
      } else if (record.podNirnoyId) {
        record.contentSnapshot = (await (db as any).podNirnoy.findUnique({ where: { id: record.podNirnoyId } })) as any
      } else if (record.verbTenseId) {
        record.contentSnapshot = (await (db as any).verbTense.findUnique({ where: { id: record.verbTenseId } })) as any
      } else if (record.formFillupId) {
        record.contentSnapshot = (await (db as any).formFillup.findUnique({ where: { id: record.formFillupId } })) as any
      }
    }

    let whereCondition: any = {}
    if (record.mcqId) {
      whereCondition = { questionPaperId_mcqId: { questionPaperId: input.questionPaperId, mcqId: record.mcqId } }
    } else if (record.cqId) {
      whereCondition = { questionPaperId_cqId: { questionPaperId: input.questionPaperId, cqId: record.cqId } }
    } else if (record.csId) {
      whereCondition = { questionPaperId_csId: { questionPaperId: input.questionPaperId, csId: record.csId } }
    } else if (record.pbqId) {
      whereCondition = { questionPaperId_pbqId: { questionPaperId: input.questionPaperId, pbqId: record.pbqId } }
    } else if (record.shortAnswerId) {
      whereCondition = { questionPaperId_shortAnswerId: { questionPaperId: input.questionPaperId, shortAnswerId: record.shortAnswerId } }
    } else if (record.paragraphId) {
      whereCondition = { questionPaperId_paragraphId: { questionPaperId: input.questionPaperId, paragraphId: record.paragraphId } }
    } else if (record.amplificationId) {
      whereCondition = { questionPaperId_amplificationId: { questionPaperId: input.questionPaperId, amplificationId: record.amplificationId } }
    } else if (record.letterId) {
      whereCondition = { questionPaperId_letterId: { questionPaperId: input.questionPaperId, letterId: record.letterId } }
    } else if (record.applicationId) {
      whereCondition = { questionPaperId_applicationId: { questionPaperId: input.questionPaperId, applicationId: record.applicationId } }
    } else if (record.summaryId) {
      whereCondition = { questionPaperId_summaryId: { questionPaperId: input.questionPaperId, summaryId: record.summaryId } }
    } else if (record.essenceId) {
      whereCondition = { questionPaperId_essenceId: { questionPaperId: input.questionPaperId, essenceId: record.essenceId } }
    } else if (record.poemEssenceId) {
      whereCondition = { questionPaperId_poemEssenceId: { questionPaperId: input.questionPaperId, poemEssenceId: record.poemEssenceId } }
    } else if (record.proseEssenceId) {
      whereCondition = { questionPaperId_proseEssenceId: { questionPaperId: input.questionPaperId, proseEssenceId: record.proseEssenceId } }
    } else if (record.poemId) {
      whereCondition = { questionPaperId_poemId: { questionPaperId: input.questionPaperId, poemId: record.poemId } }
    } else if (record.essayId) {
      whereCondition = { questionPaperId_essayId: { questionPaperId: input.questionPaperId, essayId: record.essayId } }
    } else if (record.newsReportId) {
      whereCondition = { questionPaperId_newsReportId: { questionPaperId: input.questionPaperId, newsReportId: record.newsReportId } }
    } else if (record.partsOfSpeechId) {
      whereCondition = { questionPaperId_partsOfSpeechId: { questionPaperId: input.questionPaperId, partsOfSpeechId: record.partsOfSpeechId } }
    } else if (record.rightFormOfVerbId) {
      whereCondition = { questionPaperId_rightFormOfVerbId: { questionPaperId: input.questionPaperId, rightFormOfVerbId: record.rightFormOfVerbId } }
    } else if (record.changingSentenceId) {
      whereCondition = { questionPaperId_changingSentenceId: { questionPaperId: input.questionPaperId, changingSentenceId: record.changingSentenceId } }
    } else if (record.fillInTheBlanksWithCluesId) {
      whereCondition = { questionPaperId_fillInTheBlanksWithCluesId: { questionPaperId: input.questionPaperId, fillInTheBlanksWithCluesId: record.fillInTheBlanksWithCluesId } }
    } else if (record.fillInTheBlanksWithoutCluesId) {
      whereCondition = { questionPaperId_fillInTheBlanksWithoutCluesId: { questionPaperId: input.questionPaperId, fillInTheBlanksWithoutCluesId: record.fillInTheBlanksWithoutCluesId } }
    } else if (record.substitutionTableId) {
      whereCondition = { questionPaperId_substitutionTableId: { questionPaperId: input.questionPaperId, substitutionTableId: record.substitutionTableId } }
    } else if (record.punctuationId) {
      whereCondition = { questionPaperId_punctuationId: { questionPaperId: input.questionPaperId, punctuationId: record.punctuationId } }
    } else if (record.shortCompositionId) {
      whereCondition = { questionPaperId_shortCompositionId: { questionPaperId: input.questionPaperId, shortCompositionId: record.shortCompositionId } }
    } else if (record.descriptiveQuestionId) {
      whereCondition = { questionPaperId_descriptiveQuestionId: { questionPaperId: input.questionPaperId, descriptiveQuestionId: record.descriptiveQuestionId } }
    } else if (record.shortQuestionId) {
      whereCondition = { questionPaperId_shortQuestionId: { questionPaperId: input.questionPaperId, shortQuestionId: record.shortQuestionId } }
    } else if (record.makeQuestionId) {
      whereCondition = { questionPaperId_makeQuestionId: { questionPaperId: input.questionPaperId, makeQuestionId: record.makeQuestionId } }
    } else if (record.wordMeaningId) {
      whereCondition = { questionPaperId_wordMeaningId: { questionPaperId: input.questionPaperId, wordMeaningId: record.wordMeaningId } }
    } else if (record.juktobornoId) {
      whereCondition = { questionPaperId_juktobornoId: { questionPaperId: input.questionPaperId, juktobornoId: record.juktobornoId } }
    } else if (record.ekKothayProkashId) {
      whereCondition = { questionPaperId_ekKothayProkashId: { questionPaperId: input.questionPaperId, ekKothayProkashId: record.ekKothayProkashId } }
    } else if (record.makeSentencesId) {
      whereCondition = { questionPaperId_makeSentencesId: { questionPaperId: input.questionPaperId, makeSentencesId: record.makeSentencesId } }
    } else if (record.oppositeWordId) {
      whereCondition = { questionPaperId_oppositeWordId: { questionPaperId: input.questionPaperId, oppositeWordId: record.oppositeWordId } }
    } else if (record.synonymId) {
      whereCondition = { questionPaperId_synonymId: { questionPaperId: input.questionPaperId, synonymId: record.synonymId } }
    } else if (record.sadhuToCholitoId) {
      whereCondition = { questionPaperId_sadhuToCholitoId: { questionPaperId: input.questionPaperId, sadhuToCholitoId: record.sadhuToCholitoId } }
    } else if (record.podNirnoyId) {
      whereCondition = { questionPaperId_podNirnoyId: { questionPaperId: input.questionPaperId, podNirnoyId: record.podNirnoyId } }
    } else if (record.verbTenseId) {
      whereCondition = { questionPaperId_verbTenseId: { questionPaperId: input.questionPaperId, verbTenseId: record.verbTenseId } }
    } else if (record.formFillupId) {
      whereCondition = { questionPaperId_formFillupId: { questionPaperId: input.questionPaperId, formFillupId: record.formFillupId } }
    }

    await tenantDb.questionPaperQuestion.upsert({
      where: whereCondition,
      create: record,
      update: { distributionId: input.distributionId, sectionId: input.sectionId ?? null, subSectionId: input.subSectionId ?? null },
    })
  }

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "QUESTION_ADDED",
    actorId,
    changes: { count: recordsToCreate.length, distributionId: input.distributionId, totalCredits },
  })

  return { success: true, count: recordsToCreate.length }
}

export async function bulkRemoveQuestions(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: BulkRemoveQuestionsInput,
  actorId?: string,
  tenantId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  })
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper")

  const targetQuestions = await tenantDb.questionPaperQuestion.findMany({
    where: {
      questionPaperId: input.questionPaperId,
      OR: [
        { id: { in: input.questionIds } },
        { mcqId: { in: input.questionIds } },
        { cqId: { in: input.questionIds } },
        { csId: { in: input.questionIds } },
        { pbqId: { in: input.questionIds } },
        { shortAnswerId: { in: input.questionIds } },
        { paragraphId: { in: input.questionIds } },
        { amplificationId: { in: input.questionIds } },
        { letterId: { in: input.questionIds } },
        { applicationId: { in: input.questionIds } },
        { summaryId: { in: input.questionIds } },
        { essenceId: { in: input.questionIds } },
        { poemEssenceId: { in: input.questionIds } },
        { proseEssenceId: { in: input.questionIds } },
        { poemId: { in: input.questionIds } },
        { essayId: { in: input.questionIds } },
        { newsReportId: { in: input.questionIds } },
        { partsOfSpeechId: { in: input.questionIds } },
        { rightFormOfVerbId: { in: input.questionIds } },
        { changingSentenceId: { in: input.questionIds } },
        { fillInTheBlanksWithCluesId: { in: input.questionIds } },
        { fillInTheBlanksWithoutCluesId: { in: input.questionIds } },
        { substitutionTableId: { in: input.questionIds } },
        { punctuationId: { in: input.questionIds } },
        { shortCompositionId: { in: input.questionIds } },
        { descriptiveQuestionId: { in: input.questionIds } },
        { shortQuestionId: { in: input.questionIds } },
        { makeQuestionId: { in: input.questionIds } },
        { wordMeaningId: { in: input.questionIds } },
        { juktobornoId: { in: input.questionIds } },
        { ekKothayProkashId: { in: input.questionIds } },
        { makeSentencesId: { in: input.questionIds } },
        { oppositeWordId: { in: input.questionIds } },
        { synonymId: { in: input.questionIds } },
        { sadhuToCholitoId: { in: input.questionIds } },
        { podNirnoyId: { in: input.questionIds } },
        { verbTenseId: { in: input.questionIds } },
        { formFillupId: { in: input.questionIds } },
      ],
    },
    select: { id: true, distributionId: true },
  })

  let totalRefund = 0
  if (tenantId && targetQuestions.length > 0) {
    const distIds = Array.from(new Set(targetQuestions.map((q) => q.distributionId).filter(Boolean)))
    const distributions = await tenantDb.questionPaperSubjectMarkDistribution.findMany({
      where: { id: { in: distIds } },
      select: { id: true, questionTypeId: true },
    })
    const distTypeMap = new Map(distributions.map((d) => [d.id, d.questionTypeId]))
    const costMap = await getQuestionTypesCreditCosts(
      db,
      distributions.map((d) => d.questionTypeId)
    )

    for (const q of targetQuestions) {
      const qTypeId = distTypeMap.get(q.distributionId)
      const cost = qTypeId ? costMap.get(qTypeId) ?? 1 : 1
      totalRefund += cost
    }
  }

  await tenantDb.questionPaperQuestion.deleteMany({
    where: {
      questionPaperId: input.questionPaperId,
      id: { in: targetQuestions.map((q) => q.id) },
    },
  })

  if (tenantId && totalRefund > 0) {
    await refundTenantCredits(db, {
      tenantId,
      amount: totalRefund,
      description: `Refund for bulk removed ${targetQuestions.length} question(s) from paper (${paper.title})`,
      metadata: {
        questionPaperId: input.questionPaperId,
        count: targetQuestions.length,
        totalRefund,
      },
    })
  }

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "QUESTION_REMOVED",
    actorId,
    changes: { count: targetQuestions.length, totalRefund },
  })

  return { success: true }
}
