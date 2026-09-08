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

export async function addQuestionPaperQuestion(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: AddQuestionPaperQuestionInput,
  actorId?: string
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
    input.essayId,
    input.newsReportId,
    input.partsOfSpeechId,
    input.rightFormOfVerbId,
    input.changingSentenceId,
    input.fillInTheBlanksWithCluesId,
    input.substitutionTableId,
    input.punctuationId,
    input.shortCompositionId,
  ].filter(Boolean)

  if (idsSet.length !== 1) {
    throw new Error("Exactly one question type ID must be specified")
  }

  let contentSnapshot: any = null
  let questionLabel = ""

  if (input.mcqId) {
    const item = await db.mcq.findUnique({ where: { id: input.mcqId } })
    if (!item) throw notFound("Mcq")
    questionLabel = "MCQ: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.cqId) {
    const item = await db.cq.findUnique({ where: { id: input.cqId } })
    if (!item) throw notFound("Cq")
    questionLabel = "CQ: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.shortAnswerId) {
    const item = await db.shortAnswer.findUnique({ where: { id: input.shortAnswerId } })
    if (!item) throw notFound("ShortAnswer")
    questionLabel = "ShortAnswer: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.csId) {
    const item = await (db as any).cS.findUnique({ where: { id: input.csId } })
    if (!item) throw notFound("CS")
    questionLabel = "CS: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.pbqId) {
    const item = await db.pBQ.findUnique({ where: { id: input.pbqId } })
    if (!item) throw notFound("PBQ")
    questionLabel = "PBQ: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.paragraphId) {
    const item = await db.paragraph.findUnique({ where: { id: input.paragraphId } })
    if (!item) throw notFound("Paragraph")
    questionLabel = "Paragraph: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.amplificationId) {
    const item = await db.amplification.findUnique({ where: { id: input.amplificationId } })
    if (!item) throw notFound("Amplification")
    questionLabel = "Amplification: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.letterId) {
    const item = await (db as any).letter.findUnique({ where: { id: input.letterId } })
    if (!item) throw notFound("Letter")
    questionLabel = "Letter: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.applicationId) {
    const item = await (db as any).application.findUnique({ where: { id: input.applicationId } })
    if (!item) throw notFound("Application")
    questionLabel = "Application: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.summaryId) {
    const item = await (db as any).summary.findUnique({ where: { id: input.summaryId } })
    if (!item) throw notFound("Summary")
    questionLabel = "Summary: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.essenceId) {
    const item = await (db as any).essence.findUnique({ where: { id: input.essenceId } })
    if (!item) throw notFound("Essence")
    questionLabel = "Essence: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.essayId) {
    const item = await (db as any).essay.findUnique({ where: { id: input.essayId } })
    if (!item) throw notFound("Essay")
    questionLabel = "Essay: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.newsReportId) {
    const item = await (db as any).newsReport.findUnique({ where: { id: input.newsReportId } })
    if (!item) throw notFound("NewsReport")
    questionLabel = "NewsReport: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.partsOfSpeechId) {
    const item = await db.partsOfSpeech.findUnique({ where: { id: input.partsOfSpeechId } })
    if (!item) throw notFound("PartsOfSpeech")
    questionLabel = "PartsOfSpeech: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.rightFormOfVerbId) {
    const item = await (db as any).rightFormOfVerb.findUnique({ where: { id: input.rightFormOfVerbId } })
    if (!item) throw notFound("RightFormOfVerb")
    questionLabel = "RightFormOfVerb: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.changingSentenceId) {
    const item = await (db as any).changingSentence.findUnique({ where: { id: input.changingSentenceId } })
    if (!item) throw notFound("ChangingSentence")
    questionLabel = "ChangingSentence: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.fillInTheBlanksWithCluesId) {
    const item = await db.fillInTheBlanksWithClues.findUnique({ where: { id: input.fillInTheBlanksWithCluesId } })
    if (!item) throw notFound("FillInTheBlanksWithClues")
    questionLabel = "FillInTheBlanksWithClues: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.substitutionTableId) {
    const item = await db.substitutionTable.findUnique({ where: { id: input.substitutionTableId } })
    if (!item) throw notFound("SubstitutionTable")
    questionLabel = "SubstitutionTable: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.punctuationId) {
    const item = await (db as any).punctuation.findUnique({ where: { id: input.punctuationId } })
    if (!item) throw notFound("Punctuation")
    questionLabel = "Punctuation: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  } else if (input.shortCompositionId) {
    const item = await (db as any).shortComposition.findUnique({ where: { id: input.shortCompositionId } })
    if (!item) throw notFound("ShortComposition")
    questionLabel = "ShortComposition: " + item.id
    if (paper.status === "Published") contentSnapshot = JSON.parse(JSON.stringify(item))
  }

  const dist = await tenantDb.questionPaperSubjectMarkDistribution.findUnique({
    where: { id: input.distributionId },
  })

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
      essayId: input.essayId,
      newsReportId: input.newsReportId,
      partsOfSpeechId: input.partsOfSpeechId,
      rightFormOfVerbId: input.rightFormOfVerbId,
      changingSentenceId: input.changingSentenceId,
      fillInTheBlanksWithCluesId: input.fillInTheBlanksWithCluesId,
      substitutionTableId: input.substitutionTableId,
      punctuationId: input.punctuationId,
      shortCompositionId: input.shortCompositionId,
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
    changes: { questionId: paperQuestion.id, label: questionLabel, distributionId: input.distributionId },
  })

  return paperQuestion
}

export async function removeQuestionPaperQuestion(
  tenantDb: TenantPrismaClient,
  input: RemoveQuestionPaperQuestionInput,
  actorId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  })
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper")

  const where: any = { questionPaperId: input.questionPaperId }
  if (input.questionType === "MCQ") {
    where.mcqId = input.questionId
  } else if (input.questionType === "CQ") {
    where.cqId = input.questionId
  } else if (input.questionType === "CS") {
    where.csId = input.questionId
  } else if (input.questionType === "SA") {
    where.shortAnswerId = input.questionId
  } else if (input.questionType === "PBQ") {
    where.pbqId = input.questionId
  } else if (input.questionType === "PARAGRAPH") {
    where.paragraphId = input.questionId
  } else if (input.questionType === "AMPLIFICATION") {
    where.amplificationId = input.questionId
  } else if (input.questionType === "LETTER") {
    where.letterId = input.questionId
  } else if (input.questionType === "APPLICATION") {
    where.applicationId = input.questionId
  } else if (input.questionType === "SUMMARY") {
    where.summaryId = input.questionId
  } else if (input.questionType === "ESSENCE") {
    where.essenceId = input.questionId
  } else if (input.questionType === "ESSAY") {
    where.essayId = input.questionId
  } else if (input.questionType === "NEWS_REPORT") {
    where.newsReportId = input.questionId
  } else if (input.questionType === "PARTS_OF_SPEECH") {
    where.partsOfSpeechId = input.questionId
  } else if (input.questionType === "RIGHT_FORM_OF_VERBS") {
    where.rightFormOfVerbId = input.questionId
  } else if (input.questionType === "CHANGING_SENTENCES") {
    where.changingSentenceId = input.questionId
  } else if (input.questionType === "FILL_IN_THE_BLANKS_WITH_CLUES") {
    where.fillInTheBlanksWithCluesId = input.questionId
  } else if (input.questionType === "SUBSTITUTION_TABLE") {
    where.substitutionTableId = input.questionId
  } else if (input.questionType === "PUNCTUATION") {
    where.punctuationId = input.questionId
  } else if (input.questionType === "SHORT_COMPOSITION") {
    where.shortCompositionId = input.questionId
  }

  const existing = await tenantDb.questionPaperQuestion.findFirst({ where })
  if (!existing) throw notFound("QuestionPaperQuestion")

  await tenantDb.questionPaperQuestion.delete({
    where: { id: existing.id },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "QUESTION_REMOVED",
    actorId,
    changes: { questionId: existing.id, type: input.questionType },
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
  actorId?: string
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

  if (recordsToCreate.length === 0) {
    return { success: true, count: 0 }
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
      } else if (record.substitutionTableId) {
        record.contentSnapshot = (await (db as any).substitutionTable.findUnique({ where: { id: record.substitutionTableId } })) as any
      } else if (record.punctuationId) {
        record.contentSnapshot = (await (db as any).punctuation.findUnique({ where: { id: record.punctuationId } })) as any
      } else if (record.shortCompositionId) {
        record.contentSnapshot = (await (db as any).shortComposition.findUnique({ where: { id: record.shortCompositionId } })) as any
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
    } else if (record.substitutionTableId) {
      whereCondition = { questionPaperId_substitutionTableId: { questionPaperId: input.questionPaperId, substitutionTableId: record.substitutionTableId } }
    } else if (record.punctuationId) {
      whereCondition = { questionPaperId_punctuationId: { questionPaperId: input.questionPaperId, punctuationId: record.punctuationId } }
    } else if (record.shortCompositionId) {
      whereCondition = { questionPaperId_shortCompositionId: { questionPaperId: input.questionPaperId, shortCompositionId: record.shortCompositionId } }
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
    changes: { count: recordsToCreate.length, distributionId: input.distributionId },
  })

  return { success: true, count: recordsToCreate.length }
}

export async function bulkRemoveQuestions(
  tenantDb: TenantPrismaClient,
  input: BulkRemoveQuestionsInput,
  actorId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  })
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper")

  await tenantDb.questionPaperQuestion.deleteMany({
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
        { essayId: { in: input.questionIds } },
        { newsReportId: { in: input.questionIds } },
        { partsOfSpeechId: { in: input.questionIds } },
        { rightFormOfVerbId: { in: input.questionIds } },
        { changingSentenceId: { in: input.questionIds } },
        { fillInTheBlanksWithCluesId: { in: input.questionIds } },
        { substitutionTableId: { in: input.questionIds } },
        { punctuationId: { in: input.questionIds } },
        { shortCompositionId: { in: input.questionIds } },
      ],
    },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "QUESTION_REMOVED",
    actorId,
    changes: { count: input.questionIds.length },
  })

  return { success: true }
}
