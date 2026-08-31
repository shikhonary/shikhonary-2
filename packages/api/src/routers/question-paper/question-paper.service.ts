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
  UpsertQuestionPaperSubSectionInput,
  DeleteQuestionPaperSubSectionInput,
  UpsertQuestionPaperSubjectInput,
  DeleteQuestionPaperSubjectInput,
  UpsertQuestionPaperDistributionInput,
  DeleteQuestionPaperDistributionInput,
  GetDistributionStatusesInput,
  GetAvailableQuestionsInput,
  BulkAssignQuestionsInput,
  BulkRemoveQuestionsInput,
  UpdateQuestionPaperSettingsInput,
  GeneratePaperSetsInput,
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

  if (input.classId && input.classId !== "All") {
    where.classId = input.classId
  }

  if (input.status) {
    where.status = input.status
  }

  if (input.isTemplate !== undefined) {
    where.isTemplate = input.isTemplate
  }

  if (input.search && input.search.trim() !== "") {
    where.OR = [
      { title: { contains: input.search.trim(), mode: "insensitive" } },
      { examName: { contains: input.search.trim(), mode: "insensitive" } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (input.sort === "title_asc") {
    orderBy = { title: "asc" }
  } else if (input.sort === "title_desc") {
    orderBy = { title: "desc" }
  } else if (input.sort === "newest") {
    orderBy = { createdAt: "desc" }
  } else if (input.sort === "oldest") {
    orderBy = { createdAt: "asc" }
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 10
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [papers, totalItems] = await Promise.all([
    tenantDb.questionPaper.findMany({
      where,
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy,
    }),
    tenantDb.questionPaper.count({ where }),
  ])

  const nextCursor =
    papers.length === limit
      ? papers[papers.length - 1]?.id
      : undefined

  return { papers, totalItems, nextCursor }
}

export async function getQuestionPaperById(
  db: PrismaClient,
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
        include: {
          subSections: {
            orderBy: { orderIndex: "asc" },
          },
        },
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

  // Batch resolve cross-DB references from db in parallel
  const mcqIds = paper.questions.map((q) => q.mcqId).filter(Boolean) as string[]
  const cqIds = paper.questions.map((q) => q.cqId).filter(Boolean) as string[]
  const shortAnswerIds = paper.questions.map((q) => q.shortAnswerId).filter(Boolean) as string[]
  const paragraphIds = paper.questions.map((q) => q.paragraphId).filter(Boolean) as string[]
  const amplificationIds = paper.questions.map((q) => q.amplificationId).filter(Boolean) as string[]

  const subjectIds = Array.from(new Set(paper.subjects.map((s) => s.subjectId).filter(Boolean)))
  const questionTypeIds = Array.from(
    new Set(paper.subjects.flatMap((s) => s.distributions.map((d) => d.questionTypeId)).filter(Boolean))
  )

  const [
    mcqs,
    cqs,
    shortAnswers,
    paragraphs,
    amplifications,
    academicClass,
    academicSubjects,
    questionTypes,
  ] = await Promise.all([
    mcqIds.length > 0
      ? db.mcq.findMany({
        where: { id: { in: mcqIds } },
        include: {
          attachments: true,
          chapter: true,
          questionType: true,
        },
      })
      : [],
    cqIds.length > 0
      ? db.cq.findMany({
        where: { id: { in: cqIds } },
        include: {
          attachments: true,
          answer: true,
          chapter: true,
          questionType: true,
        },
      })
      : [],
    shortAnswerIds.length > 0
      ? db.shortAnswer.findMany({
        where: { id: { in: shortAnswerIds } },
        include: {
          attachments: true,
          chapter: true,
          questionType: true,
        },
      })
      : [],
    paragraphIds.length > 0
      ? db.paragraph.findMany({
        where: { id: { in: paragraphIds } },
        include: {
          chapter: true,
          questionType: true,
        },
      })
      : [],
    amplificationIds.length > 0
      ? db.amplification.findMany({
        where: { id: { in: amplificationIds } },
        include: {
          chapter: true,
          questionType: true,
        },
      })
      : [],
    paper.classId ? db.academicClass.findUnique({ where: { id: paper.classId } }) : null,
    subjectIds.length > 0 ? db.academicSubject.findMany({ where: { id: { in: subjectIds } } }) : [],
    questionTypeIds.length > 0 ? db.questionType.findMany({ where: { id: { in: questionTypeIds } } }) : [],
  ])

  const mcqMap = new Map(mcqs.map((m) => [m.id, m]))
  const cqMap = new Map(cqs.map((c) => [c.id, c]))
  const shortMap = new Map(shortAnswers.map((s) => [s.id, s]))
  const paragraphMap = new Map(paragraphs.map((p) => [p.id, p]))
  const amplificationMap = new Map(amplifications.map((a) => [a.id, a]))
  const subjectMap = new Map(academicSubjects.map((s) => [s.id, s]))
  const qTypeMap = new Map(questionTypes.map((t) => [t.id, t]))

  // Enrich subjects & distributions with main DB data
  const enrichedSubjects = paper.subjects.map((sub) => ({
    ...sub,
    subject: subjectMap.get(sub.subjectId) || null,
    distributions: sub.distributions.map((dist) => ({
      ...dist,
      questionType: qTypeMap.get(dist.questionTypeId) || null,
    })),
  }))

  // Enrich questions with resolved entity
  const enrichedQuestions = paper.questions.map((q) => {
    let resolvedMcq = q.mcqId ? mcqMap.get(q.mcqId) || null : null
    let resolvedCq = q.cqId ? cqMap.get(q.cqId) || null : null
    let resolvedShort = q.shortAnswerId ? shortMap.get(q.shortAnswerId) || null : null
    let resolvedParagraph = q.paragraphId ? paragraphMap.get(q.paragraphId) || null : null
    let resolvedAmplification = q.amplificationId ? amplificationMap.get(q.amplificationId) || null : null

    // If published snapshot exists and live wasn't found (or is published), fallback to snapshot
    if (!resolvedMcq && q.mcqId && q.contentSnapshot) {
      resolvedMcq = q.contentSnapshot as any
    }
    if (!resolvedCq && q.cqId && q.contentSnapshot) {
      resolvedCq = q.contentSnapshot as any
    }
    if (!resolvedShort && q.shortAnswerId && q.contentSnapshot) {
      resolvedShort = q.contentSnapshot as any
    }
    if (!resolvedParagraph && q.paragraphId && q.contentSnapshot) {
      resolvedParagraph = q.contentSnapshot as any
    }
    if (!resolvedAmplification && q.amplificationId && q.contentSnapshot) {
      resolvedAmplification = q.contentSnapshot as any
    }

    return {
      ...q,
      mcq: resolvedMcq,
      cq: resolvedCq,
      shortAnswer: resolvedShort,
      paragraph: resolvedParagraph,
      amplification: resolvedAmplification,
    }
  })

  return {
    ...paper,
    academicClass,
    subjects: enrichedSubjects,
    questions: enrichedQuestions,
  }
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
      timeInMinutes: input.timeInMinutes,
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
  if (data.timeInMinutes !== undefined) updateData.timeInMinutes = data.timeInMinutes

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
// Sub-Section Mutations
// ---------------------------------------------------------------------------

export async function upsertQuestionPaperSubSection(
  tenantDb: TenantPrismaClient,
  input: UpsertQuestionPaperSubSectionInput,
) {
  if (input.id) {
    const existing = await tenantDb.questionPaperSubSection.findUnique({
      where: { id: input.id },
    })
    if (!existing) throw notFound("QuestionPaperSubSection")

    return tenantDb.questionPaperSubSection.update({
      where: { id: input.id },
      data: {
        title: input.title,
        titleBn: input.titleBn,
        instructions: input.instructions,
        orderIndex: input.orderIndex,
      },
    })
  }

  return tenantDb.questionPaperSubSection.create({
    data: {
      sectionId: input.sectionId,
      title: input.title,
      titleBn: input.titleBn,
      instructions: input.instructions,
      orderIndex: input.orderIndex,
    },
  })
}

export async function deleteQuestionPaperSubSection(
  tenantDb: TenantPrismaClient,
  input: DeleteQuestionPaperSubSectionInput,
) {
  const existing = await tenantDb.questionPaperSubSection.findUnique({
    where: { id: input.id },
  })
  if (!existing) throw notFound("QuestionPaperSubSection")

  await tenantDb.questionPaperSubSection.delete({
    where: { id: input.id },
  })

  return { success: true }
}

// ---------------------------------------------------------------------------
// Subject Mutations
// ---------------------------------------------------------------------------

export async function upsertQuestionPaperSubject(
  db: PrismaClient,
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

    // Auto-create sections and sub-sections based on subject question structure in main DB
    const mainSections = await db.subjectQuestionSection.findMany({
      where: { subjectId: input.subjectId },
      include: {
        subSections: true,
      },
      orderBy: { position: "asc" },
    })

    for (const mSec of mainSections) {
      let pSection = await tenantDb.questionPaperSection.findFirst({
        where: {
          questionPaperId: input.questionPaperId,
          title: mSec.nameEn,
          titleBn: mSec.nameBn,
        },
      })
      if (!pSection) {
        pSection = await tenantDb.questionPaperSection.create({
          data: {
            questionPaperId: input.questionPaperId,
            title: mSec.nameEn,
            titleBn: mSec.nameBn,
            orderIndex: mSec.position,
          },
        })
      }

      for (const mSub of mSec.subSections) {
        const pSub = await tenantDb.questionPaperSubSection.findFirst({
          where: {
            sectionId: pSection.id,
            title: mSub.nameEn,
            titleBn: mSub.nameBn,
          },
        })
        if (!pSub) {
          await tenantDb.questionPaperSubSection.create({
            data: {
              sectionId: pSection.id,
              title: mSub.nameEn,
              titleBn: mSub.nameBn,
              orderIndex: mSub.position,
              instructions: mSub.instructions ?? null,
            },
          })
        }
      }
    }
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
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: UpsertQuestionPaperDistributionInput,
  actorId?: string
) {
  const subject = await tenantDb.questionPaperSubject.findUnique({
    where: { id: input.paperSubjectId },
  })
  if (!subject) throw notFound("QuestionPaperSubject")

  // Resolve sectionId and subSectionId from pre-configured subject question structure in main DB
  let sectionId: string | null = null
  let subSectionId: string | null = null

  const sqType = await db.subjectQuestionType.findFirst({
    where: {
      subjectId: subject.subjectId,
      questionTypeId: input.questionTypeId,
    },
  })

  if (sqType) {
    if (sqType.sectionId) {
      const mSec = await db.subjectQuestionSection.findUnique({
        where: { id: sqType.sectionId },
      })
      if (mSec) {
        const pSec = await tenantDb.questionPaperSection.findFirst({
          where: {
            questionPaperId: subject.questionPaperId,
            title: mSec.nameEn,
            titleBn: mSec.nameBn,
          },
        })
        if (pSec) {
          sectionId = pSec.id
        }
      }
    }

    if (sqType.subSectionId) {
      const mSub = await db.subjectQuestionSubSection.findUnique({
        where: { id: sqType.subSectionId },
      })
      if (mSub) {
        const pSub = await tenantDb.questionPaperSubSection.findFirst({
          where: {
            section: { questionPaperId: subject.questionPaperId },
            title: mSub.nameEn,
            titleBn: mSub.nameBn,
          },
        })
        if (pSub) {
          subSectionId = pSub.id
          sectionId = pSub.sectionId
        }
      }
    }
  }

  const attemptCount = input.questionsToAttempt ?? input.questionCount
  const totalMarks = input.marksPerQuestion * attemptCount
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
        questionTypeLabel: input.questionTypeLabel,
        marksPerQuestion: input.marksPerQuestion,
        questionCount: input.questionCount,
        totalMarks,
        questionsToAttempt: input.questionsToAttempt,
        orderIndex: input.orderIndex,
        sectionId: sectionId ?? undefined,
        subSectionId: subSectionId ?? undefined,
      },
    })
  } else {
    dist = await tenantDb.questionPaperSubjectMarkDistribution.create({
      data: {
        paperSubjectId: input.paperSubjectId,
        questionTypeId: input.questionTypeId,
        questionTypeName: input.questionTypeName,
        questionTypeLabel: input.questionTypeLabel,
        marksPerQuestion: input.marksPerQuestion,
        questionCount: input.questionCount,
        totalMarks,
        questionsToAttempt: input.questionsToAttempt,
        orderIndex: input.orderIndex,
        sectionId,
        subSectionId,
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
  } else if (input.questionType === "SA") {
    where.shortAnswerId = input.questionId
  } else if (input.questionType === "PARAGRAPH") {
    where.paragraphId = input.questionId
  } else if (input.questionType === "AMPLIFICATION") {
    where.amplificationId = input.questionId
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

// ---------------------------------------------------------------------------
// Builder Service Functions
// ---------------------------------------------------------------------------

export async function getQuestionPaperDistributionStatuses(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: GetDistributionStatusesInput
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
    include: {
      subjects: {
        include: {
          distributions: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      questions: true,
    },
  })

  if (!paper || paper.deletedAt) {
    throw notFound("QuestionPaper")
  }

  const questionTypeIds = Array.from(
    new Set(paper.subjects.flatMap((s) => s.distributions.map((d) => d.questionTypeId)).filter(Boolean))
  )
  const questionTypes = await db.questionType.findMany({
    where: { id: { in: questionTypeIds } },
  })
  const qTypeMap = new Map(questionTypes.map((t) => [t.id, t]))

  // Count questions per distribution
  const countsByDist = new Map<string, number>()
  for (const q of paper.questions) {
    const cur = countsByDist.get(q.distributionId) || 0
    countsByDist.set(q.distributionId, cur + 1)
  }

  const statuses: Array<{
    distributionId: string
    paperSubjectId: string
    subjectId: string
    subjectName: string
    questionTypeId: string
    questionTypeName: string
    questionTypeLabel: string | null
    targetCount: number
    addedCount: number
    marksPerQuestion: number
    totalMarks: number
    status: "COMPLETED" | "ACTIVE" | "LOCKED" | "INCOMPLETE"
    questionType: any
  }> = []

  let foundActive = false

  for (const sub of paper.subjects) {
    for (const dist of sub.distributions) {
      const addedCount = countsByDist.get(dist.id) || 0
      const targetCount = dist.questionCount

      const isComplete = addedCount >= targetCount && targetCount > 0

      let status: "COMPLETED" | "ACTIVE" | "LOCKED" | "INCOMPLETE" = "INCOMPLETE"
      if (isComplete) {
        status = "COMPLETED"
      } else if (!foundActive) {
        status = "ACTIVE"
        foundActive = true
      } else {
        status = "LOCKED"
      }

      statuses.push({
        distributionId: dist.id,
        paperSubjectId: sub.id,
        subjectId: sub.subjectId,
        subjectName: sub.subjectName,
        questionTypeId: dist.questionTypeId,
        questionTypeName: dist.questionTypeName,
        questionTypeLabel: dist.questionTypeLabel || null,
        targetCount,
        addedCount,
        marksPerQuestion: dist.marksPerQuestion,
        totalMarks: dist.totalMarks,
        status,
        questionType: qTypeMap.get(dist.questionTypeId) || null,
      })
    }
  }

  return statuses
}

export async function getAvailableQuestions(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: GetAvailableQuestionsInput
) {
  const { subjectId, chapterId, questionTypeId, category, difficulty, search, board, year, excludePaperId, limit, cursor } = input

  const excludedMcqIds = new Set<string>()
  const excludedCqIds = new Set<string>()
  const excludedShortIds = new Set<string>()
  const excludedParagraphIds = new Set<string>()
  const excludedAmplificationIds = new Set<string>()

  console.log(category)

  if (excludePaperId) {
    const existing = await tenantDb.questionPaperQuestion.findMany({
      where: { questionPaperId: excludePaperId },
      select: { mcqId: true, cqId: true, shortAnswerId: true, paragraphId: true, amplificationId: true },
    })
    for (const q of existing) {
      if (q.mcqId) excludedMcqIds.add(q.mcqId)
      if (q.cqId) excludedCqIds.add(q.cqId)
      if (q.shortAnswerId) excludedShortIds.add(q.shortAnswerId)
      if (q.paragraphId) excludedParagraphIds.add(q.paragraphId)
      if (q.amplificationId) excludedAmplificationIds.add(q.amplificationId)
    }
  }

  const whereCommon: any = {
    subjectId,
    isActive: true,
  }
  if (chapterId && chapterId !== "all" && chapterId !== "All") whereCommon.chapterId = chapterId
  if (difficulty && difficulty !== "all" && difficulty !== "All") whereCommon.difficulty = difficulty
  if (year) whereCommon.year = year
  if (board && board !== "all" && board !== "All") {
    const parts = board.split("-")
    const yearPart = parts[parts.length - 1]
    const sourcePart = parts.slice(0, parts.length - 1).join("-")
    if (sourcePart && yearPart && !isNaN(Number(yearPart))) {
      whereCommon.source = sourcePart
      whereCommon.year = Number(yearPart)
    }
  }

  if (category === "CQ") {
    const where: any = { ...whereCommon }
    if (questionTypeId && questionTypeId !== "all" && questionTypeId !== "All") {
      where.questionTypeId = questionTypeId
    }
    if (search && search.trim()) {
      where.OR = [
        { questionA: { contains: search.trim(), mode: "insensitive" } },
        { questionB: { contains: search.trim(), mode: "insensitive" } },
        { context: { contains: search.trim(), mode: "insensitive" } },
      ]
    }
    const cqs = await db.cq.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        chapter: true,
        questionType: true,
        answer: true,
        attachments: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const hasNext = cqs.length > limit
    const items = hasNext ? cqs.slice(0, limit) : cqs
    const nextCursor = hasNext ? items[items.length - 1]?.id : undefined

    return {
      category: "CQ",
      items: items.map((c) => ({
        ...c,
        isAssigned: excludedCqIds.has(c.id),
      })),
      nextCursor,
    }
  }

  if (category === "PARAGRAPH") {
    const where: any = { ...whereCommon }
    delete where.isActive
    if (questionTypeId && questionTypeId !== "all" && questionTypeId !== "All") {
      where.questionTypeId = questionTypeId
    }
    if (search && search.trim()) {
      where.name = { contains: search.trim(), mode: "insensitive" }
    }
    const paragraphs = await db.paragraph.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        chapter: true,
        questionType: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const hasNext = paragraphs.length > limit
    const items = hasNext ? paragraphs.slice(0, limit) : paragraphs
    const nextCursor = hasNext ? items[items.length - 1]?.id : undefined

    return {
      category: "PARAGRAPH",
      items: items.map((p) => ({
        ...p,
        isAssigned: excludedParagraphIds.has(p.id),
      })),
      nextCursor,
    }
  }

  if (category === "AMPLIFICATION") {
    const where: any = { ...whereCommon }
    delete where.isActive
    if (questionTypeId && questionTypeId !== "all" && questionTypeId !== "All") {
      where.questionTypeId = questionTypeId
    }
    if (search && search.trim()) {
      where.title = { contains: search.trim(), mode: "insensitive" }
    }
    const amplifications = await db.amplification.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        chapter: true,
        questionType: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const hasNext = amplifications.length > limit
    const items = hasNext ? amplifications.slice(0, limit) : amplifications
    const nextCursor = hasNext ? items[items.length - 1]?.id : undefined

    return {
      category: "AMPLIFICATION",
      items: items.map((a) => ({
        ...a,
        isAssigned: excludedAmplificationIds.has(a.id),
      })),
      nextCursor,
    }
  }

  if (category === "SA") {
    const where: any = { ...whereCommon }
    if (questionTypeId && questionTypeId !== "all" && questionTypeId !== "All") {
      where.questionTypeId = questionTypeId
    }
    if (search && search.trim()) {
      where.question = { contains: search.trim(), mode: "insensitive" }
    }
    const shorts = await db.shortAnswer.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        chapter: true,
        questionType: true,
        attachments: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const hasNext = shorts.length > limit
    const items = hasNext ? shorts.slice(0, limit) : shorts
    const nextCursor = hasNext ? items[items.length - 1]?.id : undefined

    return {
      category: "SA",
      items: items.map((s) => ({
        ...s,
        isAssigned: excludedShortIds.has(s.id),
      })),
      nextCursor,
    }
  }

  // Default: MCQ
  const where: any = { ...whereCommon }
  if (questionTypeId && questionTypeId !== "all" && questionTypeId !== "All") {
    where.questionTypeId = questionTypeId
  }
  if (search && search.trim()) {
    where.question = { contains: search.trim(), mode: "insensitive" }
  }
  const mcqs = await db.mcq.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    include: {
      chapter: true,
      questionType: true,
      attachments: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const hasNext = mcqs.length > limit
  const items = hasNext ? mcqs.slice(0, limit) : mcqs
  const nextCursor = hasNext ? items[items.length - 1]?.id : undefined

  console.log(items)

  return {
    category: "MCQ",
    items: items.map((m) => ({
      ...m,
      isAssigned: excludedMcqIds.has(m.id),
    })),
    nextCursor,
  }
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
        sectionId: input.sectionId ?? null,
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
        sectionId: input.sectionId ?? null,
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
        sectionId: input.sectionId ?? null,
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
        sectionId: input.sectionId ?? null,
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
        sectionId: input.sectionId ?? null,
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
      } else if (record.shortAnswerId) {
        record.contentSnapshot = (await db.shortAnswer.findUnique({ where: { id: record.shortAnswerId } })) as any
      } else if (record.paragraphId) {
        record.contentSnapshot = (await db.paragraph.findUnique({ where: { id: record.paragraphId } })) as any
      } else if (record.amplificationId) {
        record.contentSnapshot = (await db.amplification.findUnique({ where: { id: record.amplificationId } })) as any
      }
    }
    await tenantDb.questionPaperQuestion.upsert({
      where: record.mcqId
        ? { questionPaperId_mcqId: { questionPaperId: input.questionPaperId, mcqId: record.mcqId } }
        : record.cqId
          ? { questionPaperId_cqId: { questionPaperId: input.questionPaperId, cqId: record.cqId } }
          : record.shortAnswerId
            ? { questionPaperId_shortAnswerId: { questionPaperId: input.questionPaperId, shortAnswerId: record.shortAnswerId } }
            : record.paragraphId
              ? { questionPaperId_paragraphId: { questionPaperId: input.questionPaperId, paragraphId: record.paragraphId } }
              : { questionPaperId_amplificationId: { questionPaperId: input.questionPaperId, amplificationId: record.amplificationId! } },
      create: record,
      update: { distributionId: input.distributionId, sectionId: input.sectionId ?? null },
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
        { shortAnswerId: { in: input.questionIds } },
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

export async function updateQuestionPaperSettings(
  tenantDb: TenantPrismaClient,
  input: UpdateQuestionPaperSettingsInput,
  actorId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.id },
  })
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper")

  const updated = await tenantDb.questionPaper.update({
    where: { id: input.id },
    data: {
      settings: input.settings,
    },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.id,
    action: "SETTINGS_UPDATED",
    actorId,
    changes: { settings: input.settings },
  })

  return updated
}

export async function generatePaperSets(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: GeneratePaperSetsInput,
  actorId?: string
) {
  const source = await getQuestionPaperById(db, tenantDb, { id: input.sourcePaperId })
  if (!source) throw notFound("QuestionPaper")

  const generatedPapers: Array<{ id: string; title: string; setCode: string }> = []

  for (const setCode of input.setCodes) {
    const newSettings = {
      ...((source.settings as any) || {}),
      setCode,
      showSetCode: true,
    }

    const createdPaper = await tenantDb.questionPaper.create({
      data: {
        title: `${source.title} (সেট ${setCode})`,
        examName: source.examName,
        description: source.description,
        classId: source.classId,
        className: source.className,
        settings: newSettings,
        instructions: source.instructions ?? [],
        isTemplate: false,
        status: "Draft",
        total: source.total,
        timeInMinutes: source.timeInMinutes,
        createdBy: actorId,
      },
    })

    const sectionMap = new Map<string, string>()
    for (const sec of source.sections) {
      const newSec = await tenantDb.questionPaperSection.create({
        data: {
          questionPaperId: createdPaper.id,
          title: sec.title,
          titleBn: sec.titleBn,
          instructions: sec.instructions,
          orderIndex: sec.orderIndex,
        },
      })
      sectionMap.set(sec.id, newSec.id)
    }

    const distMap = new Map<string, string>()
    for (const sub of source.subjects) {
      const newSub = await tenantDb.questionPaperSubject.create({
        data: {
          questionPaperId: createdPaper.id,
          subjectId: sub.subjectId,
          subjectName: sub.subjectName,
          subjectTotal: sub.subjectTotal,
        },
      })

      for (const dist of sub.distributions) {
        const newDist = await tenantDb.questionPaperSubjectMarkDistribution.create({
          data: {
            paperSubjectId: newSub.id,
            questionTypeId: dist.questionTypeId,
            questionTypeName: dist.questionTypeName,
            marksPerQuestion: dist.marksPerQuestion,
            questionCount: dist.questionCount,
            totalMarks: dist.totalMarks,
            questionsToAttempt: dist.questionsToAttempt,
            orderIndex: dist.orderIndex,
          },
        })
        distMap.set(dist.id, newDist.id)
      }
    }

    const questionsByDist = new Map<string, any[]>()
    for (const q of source.questions) {
      const arr = questionsByDist.get(q.distributionId) || []
      arr.push(q)
      questionsByDist.set(q.distributionId, arr)
    }

    let globalOrder = 0
    for (const [oldDistId, qList] of questionsByDist.entries()) {
      const newDistId = distMap.get(oldDistId)
      if (!newDistId) continue

      let processedList = [...qList]
      if (input.shuffleQuestions) {
        for (let i = processedList.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
            ;[processedList[i], processedList[j]] = [processedList[j]!, processedList[i]!]
        }
      }

      for (const q of processedList) {
        const newSecId = q.sectionId ? sectionMap.get(q.sectionId) : null
        let overrides = { ...(q.overrides || {}) }

        if (input.shuffleOptions && q.mcq && q.mcq.options && q.mcq.options.length > 1) {
          const originalOptions: string[] = q.mcq.options
          const indexed = originalOptions.map((opt, i) => ({ opt, originalIndex: i }))
          for (let i = indexed.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
              ;[indexed[i], indexed[j]] = [indexed[j]!, indexed[i]!]
          }
          overrides.shuffledOptions = indexed.map((item) => item.opt)
        }

        await tenantDb.questionPaperQuestion.create({
          data: {
            questionPaperId: createdPaper.id,
            mcqId: q.mcqId,
            cqId: q.cqId,
            shortAnswerId: q.shortAnswerId,
            distributionId: newDistId,
            sectionId: newSecId,
            orderIndex: globalOrder++,
            assignedMarks: q.assignedMarks,
            overrides,
            contentSnapshot: q.contentSnapshot ?? null,
          },
        })
      }
    }

    await logHistory(tenantDb, {
      questionPaperId: createdPaper.id,
      action: "CREATED",
      actorId,
      changes: { setCode, generatedFrom: source.id },
    })

    generatedPapers.push({
      id: createdPaper.id,
      title: createdPaper.title,
      setCode,
    })
  }

  return {
    success: true,
    generatedPapers,
  }
}

