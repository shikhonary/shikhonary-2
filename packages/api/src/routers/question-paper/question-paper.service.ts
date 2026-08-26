import type { PrismaClient } from "@workspace/db/main"
import type { TenantPrismaClient } from "@workspace/db/tenant"
import { notFound } from "../../utils/errors"
import type {
  ListQuestionPapersInput,
  GetQuestionPaperInput,
  CreateQuestionPaperInput,
  UpdateQuestionPaperInput,
  DeleteQuestionPaperInput,
  DuplicateQuestionPaperInput,
  AddQuestionPaperQuestionInput,
  RemoveQuestionPaperQuestionInput,
  ReorderQuestionPaperQuestionsInput,
  UpsertQuestionPaperSectionInput,
  DeleteQuestionPaperSectionInput,
  UpsertQuestionPaperSubjectInput,
  DeleteQuestionPaperSubjectInput,
  UpsertQuestionPaperDistributionInput,
  DeleteQuestionPaperDistributionInput,
} from "./question-paper.schema"

// ---------------------------------------------------------------------------
// Helper: History Logger
// ---------------------------------------------------------------------------

async function logHistory(
  tenantDb: TenantPrismaClient,
  params: {
    questionPaperId: string
    action: string
    actorId?: string | null
    actorType?: "USER" | "AI" | "SYSTEM"
    changes?: any
    snapshot?: any
  }
) {
  return tenantDb.questionPaperHistory.create({
    data: {
      questionPaperId: params.questionPaperId,
      action: params.action,
      actorId: params.actorId ?? null,
      actorType: params.actorType ?? "USER",
      changes: params.changes ?? {},
      snapshot: params.snapshot ?? null,
    },
  })
}

// ---------------------------------------------------------------------------
// Helper: Sync Subject and Paper Totals
// ---------------------------------------------------------------------------

async function syncTotals(
  tenantDb: TenantPrismaClient,
  questionPaperId: string,
  paperSubjectId: string
) {
  // 1. Calculate subject marks total from all its distributions
  const distributions = await tenantDb.questionPaperSubjectMarkDistribution.findMany({
    where: { paperSubjectId },
    select: { totalMarks: true },
  })
  const subjectTotal = distributions.reduce((sum, d) => sum + d.totalMarks, 0)

  // 2. Update the subject
  await tenantDb.questionPaperSubject.update({
    where: { id: paperSubjectId },
    data: { subjectTotal },
  })

  // 3. Calculate paper marks total from all its subjects
  const subjects = await tenantDb.questionPaperSubject.findMany({
    where: { questionPaperId },
    select: { subjectTotal: true },
  })
  const paperTotal = subjects.reduce((sum, s) => sum + s.subjectTotal, 0)

  // 4. Update the paper
  await tenantDb.questionPaper.update({
    where: { id: questionPaperId },
    data: { total: paperTotal },
  })
}

// ---------------------------------------------------------------------------
// Helper: Freeze Question Snapshots (when publishing)
// ---------------------------------------------------------------------------

async function freezeQuestionSnapshots(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  questionPaperId: string
) {
  const paperQuestions = await tenantDb.questionPaperQuestion.findMany({
    where: { questionPaperId },
  })

  for (const pq of paperQuestions) {
    let content: any = null

    if (pq.mcqId) {
      content = await db.mcq.findUnique({ where: { id: pq.mcqId } })
    } else if (pq.cqId) {
      content = await db.cq.findUnique({ where: { id: pq.cqId } })
    } else if (pq.shortAnswerId) {
      content = await db.shortAnswer.findUnique({ where: { id: pq.shortAnswerId } })
    }

    if (content) {
      await tenantDb.questionPaperQuestion.update({
        where: { id: pq.id },
        data: {
          contentSnapshot: JSON.parse(JSON.stringify(content)),
        },
      })
    }
  }
}

// ---------------------------------------------------------------------------
// Core Question Paper CRUD
// ---------------------------------------------------------------------------

export async function listQuestionPapers(
  tenantDb: TenantPrismaClient,
  input: ListQuestionPapersInput
) {
  const where: any = { deletedAt: null }

  if (input.classId) {
    where.classId = input.classId
  }

  if (input.status) {
    where.status = input.status
  }

  if (input.isTemplate !== undefined) {
    where.isTemplate = input.isTemplate
  }

  if (input.search && input.search.trim() !== "") {
    where.title = { contains: input.search.trim(), mode: "insensitive" }
  }

  const papers = await tenantDb.questionPaper.findMany({
    where,
    take: input.limit,
    skip: input.cursor ? 1 : 0,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    orderBy: { createdAt: "desc" },
  })

  const nextCursor =
    papers.length === input.limit
      ? papers[papers.length - 1]?.id
      : undefined

  return { papers, nextCursor }
}

export async function getQuestionPaperById(
  tenantDb: TenantPrismaClient,
  input: GetQuestionPaperInput
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.id },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
      },
      subjects: {
        include: {
          distributions: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      sections: {
        orderBy: { orderIndex: "asc" },
      },
      history: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  if (!paper || paper.deletedAt) {
    throw notFound("QuestionPaper")
  }

  return paper
}

export async function createQuestionPaper(
  tenantDb: TenantPrismaClient,
  input: CreateQuestionPaperInput,
  actorId?: string
) {
  const paper = await tenantDb.questionPaper.create({
    data: {
      title: input.title,
      examName: input.examName,
      description: input.description,
      classId: input.classId,
      className: input.className,
      settings: input.settings,
      instructions: input.instructions,
      isTemplate: input.isTemplate,
      status: "Draft",
    },
  })

  await logHistory(tenantDb, {
    questionPaperId: paper.id,
    action: "CREATED",
    actorId,
    changes: { after: paper },
  })

  return paper
}

export async function updateQuestionPaper(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: UpdateQuestionPaperInput,
  actorId?: string
) {
  const { id, ...data } = input
  const existing = await tenantDb.questionPaper.findUnique({
    where: { id },
  })

  if (!existing || existing.deletedAt) {
    throw notFound("QuestionPaper")
  }

  // Filter updates
  const updateData: any = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.examName !== undefined) updateData.examName = data.examName
  if (data.description !== undefined) updateData.description = data.description
  if (data.classId !== undefined) updateData.classId = data.classId
  if (data.className !== undefined) updateData.className = data.className
  if (data.settings !== undefined) updateData.settings = data.settings
  if (data.instructions !== undefined) updateData.instructions = data.instructions
  if (data.isTemplate !== undefined) updateData.isTemplate = data.isTemplate
  if (data.isActive !== undefined) updateData.isActive = data.isActive
  if (data.status !== undefined) updateData.status = data.status

  const updated = await tenantDb.questionPaper.update({
    where: { id },
    data: updateData,
  })

  // Log specific transitions
  let action = "SETTINGS_UPDATED"
  if (data.status === "Published" && existing.status !== "Published") {
    action = "PUBLISHED"
    // Freeze current question contents as snapshots to prevent future edits in question bank affecting this exam
    await freezeQuestionSnapshots(db, tenantDb, id)
  } else if (data.status === "Draft" && existing.status === "Published") {
    action = "UNPUBLISHED"
  } else if (data.isTemplate && !existing.isTemplate) {
    action = "TEMPLATE_CREATED"
  }

  await logHistory(tenantDb, {
    questionPaperId: id,
    action,
    actorId,
    changes: { before: existing, after: updated },
  })

  return updated
}

export async function deleteQuestionPaper(
  tenantDb: TenantPrismaClient,
  input: DeleteQuestionPaperInput,
  actorId?: string
) {
  const existing = await tenantDb.questionPaper.findUnique({
    where: { id: input.id },
  })

  if (!existing || existing.deletedAt) {
    throw notFound("QuestionPaper")
  }

  const deleted = await tenantDb.questionPaper.update({
    where: { id: input.id },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.id,
    action: "DELETED",
    actorId,
    changes: { before: existing, after: deleted },
  })

  return { success: true }
}

export async function duplicateQuestionPaper(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: DuplicateQuestionPaperInput,
  actorId?: string
) {
  const source = await tenantDb.questionPaper.findUnique({
    where: { id: input.id },
    include: {
      subjects: {
        include: {
          distributions: true,
        },
      },
      sections: true,
      questions: true,
    },
  })

  if (!source || source.deletedAt) {
    throw notFound("QuestionPaper")
  }

  // 1. Create duplicate QuestionPaper root
  const duplicate = await tenantDb.questionPaper.create({
    data: {
      title: `${source.title} (Copy)`,
      examName: source.examName,
      description: source.description,
      classId: source.classId,
      className: source.className,
      settings: source.settings ?? {},
      instructions: source.instructions ?? [],
      isTemplate: false,
      status: "Draft",
      total: source.total,
      timeInMinutes: source.timeInMinutes,
      createdBy: actorId,
    },
  })

  // 2. Duplicate sections
  const sectionIdMap = new Map<string, string>()
  for (const section of source.sections) {
    const newSection = await tenantDb.questionPaperSection.create({
      data: {
        questionPaperId: duplicate.id,
        title: section.title,
        titleBn: section.titleBn,
        instructions: section.instructions,
        orderIndex: section.orderIndex,
      },
    })
    sectionIdMap.set(section.id, newSection.id)
  }

  // 3. Duplicate subjects & mark distributions
  const distIdMap = new Map<string, string>()
  for (const subject of source.subjects) {
    const newSubject = await tenantDb.questionPaperSubject.create({
      data: {
        questionPaperId: duplicate.id,
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        subjectTotal: subject.subjectTotal,
      },
    })

    for (const dist of subject.distributions) {
      const newDist = await tenantDb.questionPaperSubjectMarkDistribution.create({
        data: {
          paperSubjectId: newSubject.id,
          questionTypeId: dist.questionTypeId,
          questionTypeName: dist.questionTypeName,
          marksPerQuestion: dist.marksPerQuestion,
          questionCount: dist.questionCount,
          totalMarks: dist.totalMarks,
          questionsToAttempt: dist.questionsToAttempt,
          orderIndex: dist.orderIndex,
        },
      })
      distIdMap.set(dist.id, newDist.id)
    }
  }

  // 4. Duplicate question junctions
  for (const question of source.questions) {
    const newDistId = distIdMap.get(question.distributionId)
    if (!newDistId) continue // sanity check

    const newSectionId = question.sectionId ? sectionIdMap.get(question.sectionId) : null

    await tenantDb.questionPaperQuestion.create({
      data: {
        questionPaperId: duplicate.id,
        mcqId: question.mcqId,
        cqId: question.cqId,
        shortAnswerId: question.shortAnswerId,
        distributionId: newDistId,
        sectionId: newSectionId,
        orderIndex: question.orderIndex,
        assignedMarks: question.assignedMarks,
        overrides: question.overrides ?? {},
        contentSnapshot: question.contentSnapshot as any,
      },
    })
  }

  await logHistory(tenantDb, {
    questionPaperId: duplicate.id,
    action: "CREATED",
    actorId,
    changes: { duplicateOf: source.id },
  })

  return duplicate
}

// ---------------------------------------------------------------------------
// Section Mutations
// ---------------------------------------------------------------------------

export async function upsertQuestionPaperSection(
  tenantDb: TenantPrismaClient,
  input: UpsertQuestionPaperSectionInput,
  actorId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  })
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper")

  let section
  let isNew = true

  if (input.id) {
    const existing = await tenantDb.questionPaperSection.findFirst({
      where: { id: input.id, questionPaperId: input.questionPaperId },
    })
    if (!existing) throw notFound("QuestionPaperSection")
    isNew = false

    section = await tenantDb.questionPaperSection.update({
      where: { id: input.id },
      data: {
        title: input.title,
        titleBn: input.titleBn,
        instructions: input.instructions,
        orderIndex: input.orderIndex,
      },
    })
  } else {
    section = await tenantDb.questionPaperSection.create({
      data: {
        questionPaperId: input.questionPaperId,
        title: input.title,
        titleBn: input.titleBn,
        instructions: input.instructions,
        orderIndex: input.orderIndex,
      },
    })
  }

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: isNew ? "SECTION_ADDED" : "SECTION_UPDATED",
    actorId,
    changes: { sectionId: section.id, title: section.title },
  })

  return section
}

export async function deleteQuestionPaperSection(
  tenantDb: TenantPrismaClient,
  input: DeleteQuestionPaperSectionInput,
  actorId?: string
) {
  const existing = await tenantDb.questionPaperSection.findFirst({
    where: { id: input.id, questionPaperId: input.questionPaperId },
  })
  if (!existing) throw notFound("QuestionPaperSection")

  await tenantDb.questionPaperSection.delete({
    where: { id: input.id },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "SECTION_REMOVED",
    actorId,
    changes: { sectionId: input.id, title: existing.title },
  })

  return { success: true }
}

// ---------------------------------------------------------------------------
// Subject Mutations
// ---------------------------------------------------------------------------

export async function upsertQuestionPaperSubject(
  tenantDb: TenantPrismaClient,
  input: UpsertQuestionPaperSubjectInput,
  actorId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  })
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper")

  let subject
  let isNew = true

  if (input.id) {
    const existing = await tenantDb.questionPaperSubject.findFirst({
      where: { id: input.id, questionPaperId: input.questionPaperId },
    })
    if (!existing) throw notFound("QuestionPaperSubject")
    isNew = false

    subject = await tenantDb.questionPaperSubject.update({
      where: { id: input.id },
      data: {
        subjectId: input.subjectId,
        subjectName: input.subjectName,
        subjectTotal: input.subjectTotal,
      },
    })
  } else {
    subject = await tenantDb.questionPaperSubject.create({
      data: {
        questionPaperId: input.questionPaperId,
        subjectId: input.subjectId,
        subjectName: input.subjectName,
        subjectTotal: input.subjectTotal,
      },
    })
  }

  // Update paper marks sum
  const subjects = await tenantDb.questionPaperSubject.findMany({
    where: { questionPaperId: input.questionPaperId },
    select: { subjectTotal: true },
  })
  const paperTotal = subjects.reduce((sum, s) => sum + s.subjectTotal, 0)
  await tenantDb.questionPaper.update({
    where: { id: input.questionPaperId },
    data: { total: paperTotal },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: isNew ? "SUBJECT_ADDED" : "SUBJECT_UPDATED",
    actorId,
    changes: { subjectId: subject.id, name: subject.subjectName },
  })

  return subject
}

export async function deleteQuestionPaperSubject(
  tenantDb: TenantPrismaClient,
  input: DeleteQuestionPaperSubjectInput,
  actorId?: string
) {
  const existing = await tenantDb.questionPaperSubject.findFirst({
    where: { id: input.id, questionPaperId: input.questionPaperId },
  })
  if (!existing) throw notFound("QuestionPaperSubject")

  await tenantDb.questionPaperSubject.delete({
    where: { id: input.id },
  })

  // Update paper total
  const subjects = await tenantDb.questionPaperSubject.findMany({
    where: { questionPaperId: input.questionPaperId },
    select: { subjectTotal: true },
  })
  const paperTotal = subjects.reduce((sum, s) => sum + s.subjectTotal, 0)
  await tenantDb.questionPaper.update({
    where: { id: input.questionPaperId },
    data: { total: paperTotal },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "SUBJECT_REMOVED",
    actorId,
    changes: { subjectId: input.id, name: existing.subjectName },
  })

  return { success: true }
}

// ---------------------------------------------------------------------------
// Mark Distribution Mutations
// ---------------------------------------------------------------------------

export async function upsertQuestionPaperDistribution(
  tenantDb: TenantPrismaClient,
  input: UpsertQuestionPaperDistributionInput,
  actorId?: string
) {
  const subject = await tenantDb.questionPaperSubject.findUnique({
    where: { id: input.paperSubjectId },
  })
  if (!subject) throw notFound("QuestionPaperSubject")

  const totalMarks = input.marksPerQuestion * input.questionCount
  let dist
  let isNew = true

  if (input.id) {
    const existing = await tenantDb.questionPaperSubjectMarkDistribution.findFirst({
      where: { id: input.id, paperSubjectId: input.paperSubjectId },
    })
    if (!existing) throw notFound("QuestionPaperSubjectMarkDistribution")
    isNew = false

    dist = await tenantDb.questionPaperSubjectMarkDistribution.update({
      where: { id: input.id },
      data: {
        questionTypeId: input.questionTypeId,
        questionTypeName: input.questionTypeName,
        marksPerQuestion: input.marksPerQuestion,
        questionCount: input.questionCount,
        totalMarks,
        questionsToAttempt: input.questionsToAttempt,
        orderIndex: input.orderIndex,
      },
    })
  } else {
    dist = await tenantDb.questionPaperSubjectMarkDistribution.create({
      data: {
        paperSubjectId: input.paperSubjectId,
        questionTypeId: input.questionTypeId,
        questionTypeName: input.questionTypeName,
        marksPerQuestion: input.marksPerQuestion,
        questionCount: input.questionCount,
        totalMarks,
        questionsToAttempt: input.questionsToAttempt,
        orderIndex: input.orderIndex,
      },
    })
  }

  // Sync totals
  await syncTotals(tenantDb, subject.questionPaperId, subject.id)

  await logHistory(tenantDb, {
    questionPaperId: subject.questionPaperId,
    action: isNew ? "DISTRIBUTION_ADDED" : "DISTRIBUTION_UPDATED",
    actorId,
    changes: { distId: dist.id, typeName: dist.questionTypeName, totalMarks },
  })

  return dist
}

export async function deleteQuestionPaperDistribution(
  tenantDb: TenantPrismaClient,
  input: DeleteQuestionPaperDistributionInput,
  actorId?: string
) {
  const existing = await tenantDb.questionPaperSubjectMarkDistribution.findUnique({
    where: { id: input.id },
    include: {
      paperSubject: true,
    },
  })
  if (!existing || existing.paperSubject.questionPaperId !== input.questionPaperId) {
    throw notFound("QuestionPaperSubjectMarkDistribution")
  }

  await tenantDb.questionPaperSubjectMarkDistribution.delete({
    where: { id: input.id },
  })

  // Sync totals
  await syncTotals(tenantDb, input.questionPaperId, existing.paperSubjectId)

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "DISTRIBUTION_REMOVED",
    actorId,
    changes: { distId: input.id, typeName: existing.questionTypeName },
  })

  return { success: true }
}

// ---------------------------------------------------------------------------
// Question Junction Mutations
// ---------------------------------------------------------------------------

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

  // Ensure only one type is set
  const idsSet = [input.mcqId, input.cqId, input.shortAnswerId].filter(Boolean)
  if (idsSet.length !== 1) {
    throw new Error("Exactly one of mcqId, cqId, or shortAnswerId must be specified")
  }

  // Check existence in main DB & capture snapshot if paper is published
  let contentSnapshot: any = null
  let questionLabel = ""

  if (input.mcqId) {
    const mcq = await db.mcq.findUnique({ where: { id: input.mcqId } })
    if (!mcq) throw notFound("Mcq")
    questionLabel = "MCQ: " + mcq.id
    if (paper.status === "Published") {
      contentSnapshot = JSON.parse(JSON.stringify(mcq))
    }
  } else if (input.cqId) {
    const cq = await db.cq.findUnique({ where: { id: input.cqId } })
    if (!cq) throw notFound("Cq")
    questionLabel = "CQ: " + cq.id
    if (paper.status === "Published") {
      contentSnapshot = JSON.parse(JSON.stringify(cq))
    }
  } else if (input.shortAnswerId) {
    const short = await db.shortAnswer.findUnique({ where: { id: input.shortAnswerId } })
    if (!short) throw notFound("ShortAnswer")
    questionLabel = "ShortAnswer: " + short.id
    if (paper.status === "Published") {
      contentSnapshot = JSON.parse(JSON.stringify(short))
    }
  }

  // Create the junction row
  const paperQuestion = await tenantDb.questionPaperQuestion.create({
    data: {
      questionPaperId: input.questionPaperId,
      mcqId: input.mcqId,
      cqId: input.cqId,
      shortAnswerId: input.shortAnswerId,
      distributionId: input.distributionId,
      sectionId: input.sectionId,
      orderIndex: input.orderIndex,
      assignedMarks: input.assignedMarks,
      overrides: input.overrides ?? {},
      contentSnapshot,
    },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "QUESTION_ADDED",
    actorId,
    changes: { questionId: paperQuestion.id, label: questionLabel },
  })

  return paperQuestion
}

export async function removeQuestionPaperQuestion(
  tenantDb: TenantPrismaClient,
  input: RemoveQuestionPaperQuestionInput,
  actorId?: string
) {
  const where: any = { questionPaperId: input.questionPaperId }
  if (input.questionType === "MCQ") {
    where.mcqId = input.questionId
  } else if (input.questionType === "CQ") {
    where.cqId = input.questionId
  } else if (input.questionType === "SHORT") {
    where.shortAnswerId = input.questionId
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

  // Bulk update ordering using prisma transactions
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

export async function getQuestionPaperHistory(
  tenantDb: TenantPrismaClient,
  input: GetQuestionPaperInput
) {
  return tenantDb.questionPaperHistory.findMany({
    where: { questionPaperId: input.id },
    orderBy: { createdAt: "desc" },
  })
}
