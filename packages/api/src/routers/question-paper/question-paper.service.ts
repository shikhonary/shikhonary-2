import type { PrismaClient } from "@workspace/db/main"
import type { TenantPrismaClient } from "@workspace/db/tenant"
import { QUESTION_TYPES, QUESTION_TYPE_CODES, normalizeQuestionTypeName } from "@workspace/utils"
import { notFound } from "../../utils/errors"
import type {
  ListQuestionPapersInput,
  GetQuestionPaperInput,
  CreateQuestionPaperInput,
  CreateQuestionPaperFullInput,
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
  UpdateDistributionLabelInput,
  GetDistributionStatusesInput,
  GetAvailableQuestionsInput,
  BulkAssignQuestionsInput,
  BulkRemoveQuestionsInput,
  UpdateQuestionPaperSettingsInput,
  GeneratePaperSetsInput,
  AddAlternativeQuestionInput,
  RemoveAlternativeQuestionInput,
  SwapAlternativeQuestionInput,
  UpdateAlternativeQuestionInput,
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
        where: { parentQuestionId: null },
        orderBy: { orderIndex: "asc" },
        include: {
          distribution: true,
          alternatives: {
            orderBy: { orOrder: "asc" },
            include: {
              distribution: true,
            },
          },
        },
      },
      subjects: {
        orderBy: { orderIndex: "asc" },
        include: {
          distributions: {
            orderBy: { orderIndex: "asc" },
            include: {
              subSections: {
                include: {
                  subSection: true,
                },
              },
            },
          },
        },
      },
      sections: {
        orderBy: { orderIndex: "asc" },
        include: {
          subSections: {
            orderBy: { orderIndex: "asc" },
            include: {
              distributions: {
                include: {
                  distribution: true,
                },
              },
            },
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

  // Batch resolve cross-DB references from db in parallel for both primary questions and alternatives
  const allPaperQuestions = [
    ...paper.questions,
    ...paper.questions.flatMap((q: any) => q.alternatives || []),
  ]

  const mcqIds = allPaperQuestions.map((q) => q.mcqId).filter(Boolean) as string[]
  const cqIds = allPaperQuestions.map((q) => q.cqId).filter(Boolean) as string[]
  const csIds = allPaperQuestions.map((q: any) => q.csId).filter(Boolean) as string[]
  const shortAnswerIds = allPaperQuestions.map((q) => q.shortAnswerId).filter(Boolean) as string[]
  const paragraphIds = allPaperQuestions.map((q) => q.paragraphId).filter(Boolean) as string[]
  const amplificationIds = allPaperQuestions.map((q) => q.amplificationId).filter(Boolean) as string[]
  const letterIds = allPaperQuestions.map((q: any) => q.letterId).filter(Boolean) as string[]
  const applicationIds = allPaperQuestions.map((q: any) => q.applicationId).filter(Boolean) as string[]
  const summaryIds = allPaperQuestions.map((q: any) => q.summaryId).filter(Boolean) as string[]
  const essenceIds = allPaperQuestions.map((q: any) => q.essenceId).filter(Boolean) as string[]
  const newsReportIds = allPaperQuestions.map((q: any) => q.newsReportId).filter(Boolean) as string[]
  const essayIds = allPaperQuestions.map((q: any) => q.essayId).filter(Boolean) as string[]

  const subjectIds = Array.from(new Set(paper.subjects.map((s) => s.subjectId).filter(Boolean)))
  const questionTypeIds = Array.from(
    new Set(paper.subjects.flatMap((s) => s.distributions.map((d) => d.questionTypeId)).filter(Boolean))
  )

  const [
    mcqs,
    cqs,
    cses,
    shortAnswers,
    paragraphs,
    amplifications,
    letters,
    applications,
    summaries,
    essences,
    newsReports,
    essays,
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
    csIds.length > 0
      ? (db as any).cS.findMany({
        where: { id: { in: csIds } },
        include: {
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
          questionType: true,
        },
      })
      : [],
    letterIds.length > 0
      ? (db as any).letter.findMany({
        where: { id: { in: letterIds } },
        include: {
          questionType: true,
        },
      })
      : [],
    applicationIds.length > 0
      ? (db as any).application.findMany({
        where: { id: { in: applicationIds } },
        include: {
          questionType: true,
        },
      })
      : [],
    summaryIds.length > 0
      ? (db as any).summary.findMany({
        where: { id: { in: summaryIds } },
        include: {
          questionType: true,
        },
      })
      : [],
    essenceIds.length > 0
      ? (db as any).essence.findMany({
        where: { id: { in: essenceIds } },
        include: {
          questionType: true,
        },
      })
      : [],
    newsReportIds.length > 0
      ? (db as any).newsReport.findMany({
        where: { id: { in: newsReportIds } },
        include: {
          questionType: true,
        },
      })
      : [],
    essayIds.length > 0
      ? (db as any).essay.findMany({
        where: { id: { in: essayIds } },
        include: {
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
  const csMap = new Map(cses.map((c: any) => [c.id, c]))
  const shortMap = new Map(shortAnswers.map((s) => [s.id, s]))
  const paragraphMap = new Map(paragraphs.map((p) => [p.id, p]))
  const amplificationMap = new Map(amplifications.map((a) => [a.id, a]))
  const letterMap = new Map(letters.map((l: any) => [l.id, l]))
  const applicationMap = new Map(applications.map((a: any) => [a.id, a]))
  const summaryMap = new Map(summaries.map((s: any) => [s.id, s]))
  const essenceMap = new Map(essences.map((e: any) => [e.id, e]))
  const newsReportMap = new Map(newsReports.map((n: any) => [n.id, n]))
  const essayMap = new Map(essays.map((e: any) => [e.id, e]))
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

  const distMap = new Map(
    enrichedSubjects.flatMap((s) => s.distributions.map((d: any) => [d.id, d]))
  )

  const enrichSingleQuestion = (q: any): any => {
    let resolvedMcq = q.mcqId ? mcqMap.get(q.mcqId) || null : null
    let resolvedCq = q.cqId ? cqMap.get(q.cqId) || null : null
    let resolvedCs = q.csId ? csMap.get(q.csId) || null : null
    let resolvedShort = q.shortAnswerId ? shortMap.get(q.shortAnswerId) || null : null
    let resolvedParagraph = q.paragraphId ? paragraphMap.get(q.paragraphId) || null : null
    let resolvedAmplification = q.amplificationId ? amplificationMap.get(q.amplificationId) || null : null
    let resolvedLetter = q.letterId ? letterMap.get(q.letterId) || null : null
    let resolvedApplication = q.applicationId ? applicationMap.get(q.applicationId) || null : null
    let resolvedSummary = q.summaryId ? summaryMap.get(q.summaryId) || null : null
    let resolvedEssence = q.essenceId ? essenceMap.get(q.essenceId) || null : null
    let resolvedNewsReport = q.newsReportId ? newsReportMap.get(q.newsReportId) || null : null
    let resolvedEssay = q.essayId ? essayMap.get(q.essayId) || null : null

    // If published snapshot exists and live wasn't found (or is published), fallback to snapshot
    if (!resolvedMcq && q.mcqId && q.contentSnapshot) {
      resolvedMcq = q.contentSnapshot as any
    }
    if (!resolvedCq && q.cqId && q.contentSnapshot) {
      resolvedCq = q.contentSnapshot as any
    }
    if (!resolvedCs && q.csId && q.contentSnapshot) {
      resolvedCs = q.contentSnapshot as any
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
    if (!resolvedLetter && q.letterId && q.contentSnapshot) {
      resolvedLetter = q.contentSnapshot as any
    }
    if (!resolvedApplication && q.applicationId && q.contentSnapshot) {
      resolvedApplication = q.contentSnapshot as any
    }
    if (!resolvedSummary && q.summaryId && q.contentSnapshot) {
      resolvedSummary = q.contentSnapshot as any
    }
    if (!resolvedEssence && q.essenceId && q.contentSnapshot) {
      resolvedEssence = q.contentSnapshot as any
    }
    if (!resolvedNewsReport && q.newsReportId && q.contentSnapshot) {
      resolvedNewsReport = q.contentSnapshot as any
    }
    if (!resolvedEssay && q.essayId && q.contentSnapshot) {
      resolvedEssay = q.contentSnapshot as any
    }

    let resolvedDist = q.distributionId ? distMap.get(q.distributionId) || q.distribution || null : q.distribution || null

    const actualQuestionTypeId =
      (resolvedEssay as any)?.questionTypeId ||
      (resolvedNewsReport as any)?.questionTypeId ||
      (resolvedEssence as any)?.questionTypeId ||
      (resolvedSummary as any)?.questionTypeId ||
      (resolvedParagraph as any)?.questionTypeId ||
      (resolvedLetter as any)?.questionTypeId ||
      (resolvedApplication as any)?.questionTypeId ||
      (resolvedAmplification as any)?.questionTypeId ||
      (resolvedCq as any)?.questionTypeId ||
      (resolvedShort as any)?.questionTypeId

    if (actualQuestionTypeId && resolvedDist && resolvedDist.questionTypeId !== actualQuestionTypeId) {
      for (const dist of distMap.values()) {
        const matchesExact = dist.questionTypeId === actualQuestionTypeId
        const matchesCategory =
          (resolvedEssay && (dist.questionTypeName?.includes("রচনা") || dist.questionTypeName?.toLowerCase().includes("essay"))) ||
          (resolvedNewsReport && (dist.questionTypeName?.includes("প্রতিবেদন") || dist.questionTypeName?.toLowerCase().includes("report"))) ||
          (resolvedEssence && (dist.questionTypeName?.includes("সারমর্ম") || dist.questionTypeName?.toLowerCase().includes("essence"))) ||
          (resolvedSummary && (dist.questionTypeName?.includes("সারাংশ") || dist.questionTypeName?.toLowerCase().includes("summary"))) ||
          (resolvedParagraph && (dist.questionTypeName?.includes("অনুচ্ছেদ") || dist.questionTypeName?.toLowerCase().includes("paragraph"))) ||
          (resolvedLetter && (dist.questionTypeName?.includes("চিঠি") || dist.questionTypeName?.includes("পত্র") || dist.questionTypeName?.toLowerCase().includes("letter"))) ||
          (resolvedApplication && (dist.questionTypeName?.includes("আবেদন") || dist.questionTypeName?.includes("দরখাস্ত") || dist.questionTypeName?.toLowerCase().includes("application"))) ||
          (resolvedAmplification && (dist.questionTypeName?.includes("ভাব-সম্প্রসারণ") || dist.questionTypeName?.toLowerCase().includes("amplification"))) ||
          (resolvedShort && (dist.questionTypeName?.includes("সংক্ষিপ্ত") || dist.questionTypeName?.toLowerCase().includes("short"))) ||
          (resolvedCq && (dist.questionTypeName?.includes("সৃজনশীল") || dist.questionTypeName?.toLowerCase().includes("cq")))

        if (matchesExact || matchesCategory) {
          resolvedDist = dist
          break
        }
      }
    }

    return {
      ...q,
      distribution: resolvedDist,
      mcq: resolvedMcq,
      cq: resolvedCq,
      cs: resolvedCs,
      shortAnswer: resolvedShort,
      paragraph: resolvedParagraph,
      amplification: resolvedAmplification,
      letter: resolvedLetter,
      application: resolvedApplication,
      summary: resolvedSummary,
      essence: resolvedEssence,
      newsReport: resolvedNewsReport,
      essay: resolvedEssay,
      alternatives: (q.alternatives || []).map(enrichSingleQuestion),
    }
  }

  // Enrich questions with resolved entity
  const enrichedQuestions = paper.questions.map(enrichSingleQuestion)

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

export function syncMarkDistribution(
  marksPerQuestion: number,
  rawMarkDist?: any,
  sqTypeMarkDist?: any
): any {
  let dist = rawMarkDist ?? sqTypeMarkDist

  if (typeof dist === "string") {
    try {
      dist = JSON.parse(dist)
    } catch {
      dist = null
    }
  }

  if (dist && typeof dist === "object" && !Array.isArray(dist)) {
    const keys = Object.keys(dist)
    if (keys.length === 1) {
      // Single-key distribution (e.g. {"a": 10} or {"ক": 10}) -> update to marksPerQuestion
      const key = keys[0]!
      return { [key]: marksPerQuestion }
    } else if (keys.length > 1) {
      if (rawMarkDist) {
        return dist
      }
      const sum = Object.values(dist).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0)
      if (sum === marksPerQuestion || sum === 0) {
        return dist
      }
      const ratio = marksPerQuestion / sum
      const scaled: Record<string, number> = {}
      for (const k of keys) {
        scaled[k] = Math.round(((Number(dist[k]) || 0) * ratio) * 100) / 100
      }
      return scaled
    }
  }

  if (Array.isArray(dist)) {
    if (dist.length === 1) {
      return [marksPerQuestion]
    }
    return dist
  }

  return { a: marksPerQuestion }
}

export async function createQuestionPaperFull(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: CreateQuestionPaperFullInput,
  actorId?: string
) {
  // 1. Create the paper
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
      createdBy: actorId,
    },
  })

  if (input.subjects.length === 0) {
    await logHistory(tenantDb, {
      questionPaperId: paper.id,
      action: "CREATED",
      actorId,
      changes: { after: paper },
    })
    return paper
  }

  // 2. Batch-fetch all subject question structures from main DB upfront
  const allSubjectIds = input.subjects.map((s) => s.subjectId)
  const allQuestionTypeIds = Array.from(
    new Set(input.subjects.flatMap((s) => s.distributions.map((d) => d.questionTypeId)))
  )

  const [mainSectionsAll, questionTypesAll] = await Promise.all([
    db.subjectQuestionSection.findMany({
      where: { subjectId: { in: allSubjectIds } },
      include: {
        subSections: {
          include: { subjectQuestionTypes: true },
          orderBy: { position: "asc" },
        },
        subjectQuestionTypes: true,
      },
      orderBy: { position: "asc" },
    }),
    allQuestionTypeIds.length > 0
      ? db.questionType.findMany({ where: { id: { in: allQuestionTypeIds } } })
      : [],
  ])

  const qTypeMap = new Map(questionTypesAll.map((t) => [t.id, t]))
  const mainSectionsBySubject = new Map<string, typeof mainSectionsAll>()
  for (const sec of mainSectionsAll) {
    const arr = mainSectionsBySubject.get(sec.subjectId) || []
    arr.push(sec)
    mainSectionsBySubject.set(sec.subjectId, arr)
  }

  let paperTotal = 0

  // 3. Process each subject + distributions + auto-create sections
  for (let i = 0; i < input.subjects.length; i++) {
    const subjectInput = input.subjects[i]!

    const createdSubject = await tenantDb.questionPaperSubject.create({
      data: {
        questionPaperId: paper.id,
        subjectId: subjectInput.subjectId,
        subjectName: subjectInput.subjectName,
        orderIndex: subjectInput.orderIndex ?? i,
        subjectTotal: 0,
      },
    })

    // Auto-create sections from main DB structure
    const mainSections = mainSectionsBySubject.get(subjectInput.subjectId) || []
    const definedTypeIds = subjectInput.questionTypeIds && subjectInput.questionTypeIds.length > 0
      ? new Set(subjectInput.questionTypeIds)
      : null

    for (const mSec of mainSections) {
      let shouldCreateSection = true
      let validSubSectionsToCreate = mSec.subSections

      if (definedTypeIds) {
        const secTypeIds = mSec.subjectQuestionTypes.map((sqt) => sqt.questionTypeId)
        const hasDirectMatch = secTypeIds.some((id) => definedTypeIds.has(id))

        validSubSectionsToCreate = mSec.subSections.filter((mSub) => {
          const subTypeIds = mSub.subjectQuestionTypes.map((sqt) => sqt.questionTypeId)
          if (subTypeIds.length > 0) {
            return subTypeIds.some((id) => definedTypeIds.has(id))
          }
          return hasDirectMatch
        })

        const hasSubMatch = validSubSectionsToCreate.length > 0
        const totalLinkedTypes = secTypeIds.length + mSec.subSections.reduce((sum, s) => sum + s.subjectQuestionTypes.length, 0)

        if (totalLinkedTypes > 0 && !hasDirectMatch && !hasSubMatch) {
          shouldCreateSection = false
        }
      }

      if (!shouldCreateSection) continue

      const pSection = await tenantDb.questionPaperSection.create({
        data: {
          questionPaperId: paper.id,
          title: mSec.nameEn,
          titleBn: mSec.nameBn,
          orderIndex: mSec.position,
          instructions: mSec.instructions ?? null,
          questionsToAttempt: null,
        },
      })

      // Batch-create sub-sections
      if (validSubSectionsToCreate.length > 0) {
        const typeCounts = new Map<string, number>()
        if (subjectInput.questionTypeIds) {
          for (const tid of subjectInput.questionTypeIds) {
            typeCounts.set(tid, (typeCounts.get(tid) || 0) + 1)
          }
        }

        const subSectionsToCreate: Array<{
          sectionId: string
          title: string
          titleBn: string | null
          orderIndex: number
          instructions: string | null
          questionsToAttempt: number
        }> = []

        for (const mSub of validSubSectionsToCreate) {
          const subTypeIds = mSub.subjectQuestionTypes.map((sqt) => sqt.questionTypeId)
          let requiredInstances = 1
          if (subjectInput.questionTypeIds && subTypeIds.length > 0) {
            const matchingCounts = subTypeIds.map((tid) => typeCounts.get(tid) || 0)
            const maxCount = Math.max(...matchingCounts)
            if (maxCount > 0) requiredInstances = maxCount
          }

          for (let idx = 0; idx < requiredInstances; idx++) {
            subSectionsToCreate.push({
              sectionId: pSection.id,
              title: mSub.nameEn,
              titleBn: mSub.nameBn,
              orderIndex: mSub.position + idx,
              instructions: mSub.instructions ?? null,
              questionsToAttempt: 0,
            })
          }
        }

        if (subSectionsToCreate.length > 0) {
          await tenantDb.questionPaperSubSection.createMany({
            data: subSectionsToCreate,
          })
        }
      }
    }

    // Create distributions for this subject
    let subjectTotal = 0

    for (const distInput of subjectInput.distributions) {
      const qType = qTypeMap.get(distInput.questionTypeId)
      const questionTypeName = qType?.nameEn || qType?.nameBn || distInput.questionTypeName
      const questionTypeLabel = distInput.questionTypeLabel || qType?.label || qType?.nameBn || qType?.nameEn || null

      // Resolve sqType from main DB upfront for section & distribution defaults
      const sqType = await db.subjectQuestionType.findFirst({
        where: {
          subjectId: subjectInput.subjectId,
          questionTypeId: distInput.questionTypeId,
        },
        include: { section: true, subSection: true },
      })

      const markDistribution = syncMarkDistribution(
        distInput.marksPerQuestion,
        distInput.markDistribution,
        sqType?.markDistribution
      )

      const attemptCount = distInput.questionsToAttempt ?? distInput.questionCount
      const totalMarks = distInput.marksPerQuestion * attemptCount

      // Resolve sectionId from matching paper section
      let sectionId: string | null = null
      if (sqType?.section) {
        const pSec = await tenantDb.questionPaperSection.findFirst({
          where: {
            questionPaperId: paper.id,
            title: sqType.section.nameEn,
            titleBn: sqType.section.nameBn,
          },
        })
        if (pSec) sectionId = pSec.id
      }

      const dist = await tenantDb.questionPaperSubjectMarkDistribution.create({
        data: {
          paperSubjectId: createdSubject.id,
          questionTypeId: distInput.questionTypeId,
          questionTypeName,
          questionTypeLabel,
          marksPerQuestion: distInput.marksPerQuestion,
          markDistribution: markDistribution as any,
          questionCount: distInput.questionCount,
          totalMarks,
          questionsToAttempt: distInput.questionsToAttempt ?? distInput.questionCount,
          orderIndex: distInput.orderIndex,
          sectionId,
        },
      })

      // Link sub-sections if applicable
      if (sectionId && sqType?.subSection) {
        const candidateSubs = await tenantDb.questionPaperSubSection.findMany({
          where: {
            sectionId,
            title: sqType.subSection.nameEn,
            titleBn: sqType.subSection.nameBn,
          },
          orderBy: { orderIndex: "asc" },
        })

        for (const sub of candidateSubs) {
          await tenantDb.questionPaperSubSectionDistribution.upsert({
            where: {
              subSectionId_distributionId: {
                subSectionId: sub.id,
                distributionId: dist.id,
              },
            },
            create: { subSectionId: sub.id, distributionId: dist.id },
            update: {},
          }).catch(() => { })
        }
      }

      if (sectionId) {
        const secSubs = await tenantDb.questionPaperSubSection.findMany({
          where: { sectionId },
          select: { questionsToAttempt: true },
        })
        const secAttemptSum = secSubs.reduce((sum, s) => sum + (s.questionsToAttempt || 0), 0)
        if (secAttemptSum > 0) {
          await tenantDb.questionPaperSection.update({
            where: { id: sectionId },
            data: { questionsToAttempt: secAttemptSum },
          }).catch(() => { })
        }
      }

      subjectTotal += totalMarks
    }

    // Update subject total
    await tenantDb.questionPaperSubject.update({
      where: { id: createdSubject.id },
      data: { subjectTotal },
    })

    paperTotal += subjectTotal
  }

  // 4. Update paper total
  await tenantDb.questionPaper.update({
    where: { id: paper.id },
    data: { total: paperTotal },
  })

  // 5. Log history
  await logHistory(tenantDb, {
    questionPaperId: paper.id,
    action: "CREATED",
    actorId,
    changes: {
      after: paper,
      subjectsCount: input.subjects.length,
      distributionsCount: input.subjects.reduce((sum, s) => sum + s.distributions.length, 0),
    },
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

  if (!existing) {
    throw notFound("QuestionPaper")
  }

  await tenantDb.questionPaper.delete({
    where: { id: input.id },
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
      questions: {
        where: { parentQuestionId: null },
        include: {
          alternatives: true,
        },
      },
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
          markDistribution: (dist.markDistribution as any) ?? undefined,
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

    const createdPrimary = await tenantDb.questionPaperQuestion.create({
      data: {
        questionPaperId: duplicate.id,
        mcqId: question.mcqId,
        cqId: question.cqId,
        csId: question.csId,
        shortAnswerId: question.shortAnswerId,
        paragraphId: question.paragraphId,
        amplificationId: question.amplificationId,
        letterId: question.letterId,
        applicationId: question.applicationId,
        summaryId: question.summaryId,
        essenceId: question.essenceId,
        essayId: question.essayId,
        newsReportId: question.newsReportId,
        distributionId: newDistId,
        sectionId: newSectionId,
        orderIndex: question.orderIndex,
        assignedMarks: question.assignedMarks,
        overrides: question.overrides ?? {},
        contentSnapshot: question.contentSnapshot as any,
      },
    })

    if (question.alternatives && question.alternatives.length > 0) {
      for (const alt of question.alternatives) {
        const altDistId = distIdMap.get(alt.distributionId) || newDistId
        await tenantDb.questionPaperQuestion.create({
          data: {
            questionPaperId: duplicate.id,
            parentQuestionId: createdPrimary.id,
            mcqId: alt.mcqId,
            cqId: alt.cqId,
            csId: alt.csId,
            shortAnswerId: alt.shortAnswerId,
            paragraphId: alt.paragraphId,
            amplificationId: alt.amplificationId,
            letterId: alt.letterId,
            applicationId: alt.applicationId,
            summaryId: alt.summaryId,
            essenceId: alt.essenceId,
            essayId: alt.essayId,
            newsReportId: alt.newsReportId,
            distributionId: altDistId,
            sectionId: newSectionId,
            orderIndex: alt.orderIndex,
            assignedMarks: alt.assignedMarks,
            orLabel: alt.orLabel || "অথবা",
            orOrder: alt.orOrder,
            overrides: alt.overrides ?? {},
            contentSnapshot: alt.contentSnapshot as any,
          },
        })
      }
    }
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
  let sub
  if (input.id) {
    const existing = await tenantDb.questionPaperSubSection.findUnique({
      where: { id: input.id },
    })
    if (!existing) throw notFound("QuestionPaperSubSection")

    sub = await tenantDb.questionPaperSubSection.update({
      where: { id: input.id },
      data: {
        title: input.title !== undefined ? input.title : existing.title,
        titleBn: input.titleBn !== undefined ? input.titleBn : existing.titleBn,
        instructions: input.instructions !== undefined ? input.instructions : existing.instructions,
        questionsToAttempt: input.questionsToAttempt !== undefined ? input.questionsToAttempt : existing.questionsToAttempt,
        orderIndex: input.orderIndex !== undefined ? input.orderIndex : existing.orderIndex,
      },
    })
  } else {
    sub = await tenantDb.questionPaperSubSection.create({
      data: {
        sectionId: input.sectionId!,
        title: input.title || "Sub-section",
        titleBn: input.titleBn,
        instructions: input.instructions,
        questionsToAttempt: input.questionsToAttempt ?? 0,
        orderIndex: input.orderIndex ?? 0,
      },
    })
  }

  return sub
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
        orderIndex: input.orderIndex ?? 0,
        subjectTotal: input.subjectTotal,
      },
    })
  } else {
    subject = await tenantDb.questionPaperSubject.create({
      data: {
        questionPaperId: input.questionPaperId,
        subjectId: input.subjectId,
        subjectName: input.subjectName,
        orderIndex: input.orderIndex ?? 0,
        subjectTotal: input.subjectTotal,
      },
    })

    // Auto-create sections and sub-sections based on subject question structure in main DB
    const definedTypeIds = input.questionTypeIds && input.questionTypeIds.length > 0
      ? new Set(input.questionTypeIds)
      : null

    const mainSections = await db.subjectQuestionSection.findMany({
      where: { subjectId: input.subjectId },
      include: {
        subSections: {
          include: {
            subjectQuestionTypes: true,
          },
          orderBy: { position: "asc" },
        },
        subjectQuestionTypes: true,
      },
      orderBy: { position: "asc" },
    })

    for (const mSec of mainSections) {
      let shouldCreateSection = true
      let validSubSectionsToCreate = mSec.subSections

      if (definedTypeIds) {
        const secTypeIds = mSec.subjectQuestionTypes.map((sqt) => sqt.questionTypeId)
        const hasDirectMatch = secTypeIds.some((id) => definedTypeIds.has(id))

        validSubSectionsToCreate = mSec.subSections.filter((mSub) => {
          const subTypeIds = mSub.subjectQuestionTypes.map((sqt) => sqt.questionTypeId)
          if (subTypeIds.length > 0) {
            return subTypeIds.some((id) => definedTypeIds.has(id))
          }
          return hasDirectMatch
        })

        const hasSubMatch = validSubSectionsToCreate.length > 0
        const totalLinkedTypes = secTypeIds.length + mSec.subSections.reduce((sum, s) => sum + s.subjectQuestionTypes.length, 0)

        if (totalLinkedTypes > 0 && !hasDirectMatch && !hasSubMatch) {
          shouldCreateSection = false
        }
      }

      if (!shouldCreateSection) {
        continue
      }

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
            instructions: mSec.instructions ?? null,
            questionsToAttempt: null,
          },
        })
      } else if (!pSection.instructions && mSec.instructions) {
        pSection = await tenantDb.questionPaperSection.update({
          where: { id: pSection.id },
          data: {
            instructions: mSec.instructions ?? pSection.instructions,
          },
        })
      }

      const typeCounts = new Map<string, number>()
      if (input.questionTypeIds) {
        for (const tid of input.questionTypeIds) {
          typeCounts.set(tid, (typeCounts.get(tid) || 0) + 1)
        }
      }

      for (const mSub of validSubSectionsToCreate) {
        const subTypeIds = mSub.subjectQuestionTypes.map((sqt) => sqt.questionTypeId)
        let requiredInstances = 1
        if (input.questionTypeIds && subTypeIds.length > 0) {
          const matchingCounts = subTypeIds.map((tid) => typeCounts.get(tid) || 0)
          const maxCount = Math.max(...matchingCounts)
          if (maxCount > 0) requiredInstances = maxCount
        }

        const existingSubs = await tenantDb.questionPaperSubSection.findMany({
          where: {
            sectionId: pSection.id,
            title: mSub.nameEn,
            titleBn: mSub.nameBn,
          },
          orderBy: { orderIndex: "asc" },
        })

        const needed = Math.max(1, requiredInstances) - existingSubs.length
        for (let i = 0; i < needed; i++) {
          await tenantDb.questionPaperSubSection.create({
            data: {
              sectionId: pSection.id,
              title: mSub.nameEn,
              titleBn: mSub.nameBn,
              orderIndex: mSub.position + existingSubs.length + i,
              instructions: mSub.instructions ?? null,
              questionsToAttempt: 0,
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
        const existingLinks = await tenantDb.questionPaperSubSectionDistribution.findMany({
          where: { distribution: { paperSubjectId: subject.id } },
          select: { subSectionId: true },
        })
        const usedSubIds = new Set(existingLinks.map((d) => d.subSectionId).filter(Boolean))

        const candidateSubs = await tenantDb.questionPaperSubSection.findMany({
          where: {
            section: { questionPaperId: subject.questionPaperId },
            title: mSub.nameEn,
            titleBn: mSub.nameBn,
          },
          orderBy: { orderIndex: "asc" },
        })

        const pSub = candidateSubs.find((s) => !usedSubIds.has(s.id)) || candidateSubs[0]

        if (pSub) {
          subSectionId = pSub.id
          sectionId = pSub.sectionId
        }
      }
    }
  }

  let questionTypeName = input.questionTypeName
  let questionTypeLabel = input.questionTypeLabel

  if (input.questionTypeId) {
    const qType = await db.questionType.findUnique({ where: { id: input.questionTypeId } })
    if (qType) {
      questionTypeName = qType.nameEn || qType.nameBn || questionTypeName
      questionTypeLabel = input.questionTypeLabel || qType.label || qType.nameBn || qType.nameEn
    }
  }

  let dist
  let isNew = true

  if (input.id) {
    const existing = await tenantDb.questionPaperSubjectMarkDistribution.findFirst({
      where: { id: input.id, paperSubjectId: input.paperSubjectId },
    })
    if (!existing) throw notFound("QuestionPaperSubjectMarkDistribution")
    isNew = false

    const markDistribution = syncMarkDistribution(
      input.marksPerQuestion,
      input.markDistribution,
      existing.markDistribution ?? sqType?.markDistribution
    )

    const attemptCount = input.questionsToAttempt ?? input.questionCount
    const totalMarks = input.marksPerQuestion * attemptCount

    dist = await tenantDb.questionPaperSubjectMarkDistribution.update({
      where: { id: input.id },
      data: {
        questionTypeId: input.questionTypeId,
        questionTypeName,
        questionTypeLabel,
        marksPerQuestion: input.marksPerQuestion,
        markDistribution,
        questionCount: input.questionCount,
        totalMarks,
        questionsToAttempt: input.questionsToAttempt !== undefined ? input.questionsToAttempt : (existing.questionsToAttempt ?? input.questionCount),
        orderIndex: input.orderIndex ?? existing.orderIndex,
        sectionId: input.sectionId ?? sectionId ?? undefined,
      },
    })
  } else {
    const markDistribution = syncMarkDistribution(
      input.marksPerQuestion,
      input.markDistribution,
      sqType?.markDistribution
    )

    const attemptCount = input.questionsToAttempt ?? input.questionCount
    const totalMarks = input.marksPerQuestion * attemptCount

    dist = await tenantDb.questionPaperSubjectMarkDistribution.create({
      data: {
        paperSubjectId: input.paperSubjectId,
        questionTypeId: input.questionTypeId,
        questionTypeName,
        questionTypeLabel,
        marksPerQuestion: input.marksPerQuestion,
        markDistribution,
        questionCount: input.questionCount,
        totalMarks,
        questionsToAttempt: input.questionsToAttempt ?? input.questionCount,
        orderIndex: input.orderIndex,
        sectionId: input.sectionId ?? sectionId,
      },
    })
  }

  const targetSecId = input.sectionId ?? sectionId
  let targetSubIds: string[] = []

  if (input.subSectionIds && input.subSectionIds.length > 0) {
    targetSubIds = input.subSectionIds
  } else if (input.subSectionId) {
    targetSubIds = [input.subSectionId]
  } else if (targetSecId) {
    const linkedSqTypes = await db.subjectQuestionType.findMany({
      where: {
        subjectId: subject.subjectId,
        questionTypeId: input.questionTypeId,
        sectionId: sqType?.sectionId || undefined,
      },
      include: { subSection: true },
    })
    const linkedSubNames = linkedSqTypes.map((l) => l.subSection?.nameEn).filter(Boolean) as string[]
    const candidateSubs = await tenantDb.questionPaperSubSection.findMany({
      where: {
        sectionId: targetSecId,
        ...(linkedSubNames.length > 0 ? {
          OR: linkedSubNames.map((n) => ({ title: n })),
        } : {}),
      },
    })
    targetSubIds = candidateSubs.map((s) => s.id)
  }

  // Link sub-sections in many-to-many join table
  for (const subId of targetSubIds) {
    await tenantDb.questionPaperSubSectionDistribution.upsert({
      where: {
        subSectionId_distributionId: {
          subSectionId: subId,
          distributionId: dist.id,
        },
      },
      create: {
        subSectionId: subId,
        distributionId: dist.id,
      },
      update: {},
    }).catch(() => { })
  }

  if (targetSubIds.length > 0) {
    if (input.id && input.subSectionId && input.questionsToAttempt !== undefined && input.questionsToAttempt !== null) {
      await tenantDb.questionPaperSubSection.update({
        where: { id: input.subSectionId },
        data: { questionsToAttempt: input.questionsToAttempt },
      }).catch(() => { })
    } else {
      const isSharedType = targetSubIds.length > 1
      const secSubs = targetSecId ? await tenantDb.questionPaperSubSection.findMany({ where: { sectionId: targetSecId } }) : []
      if (isSharedType || secSubs.length > 1) {
        for (const subId of targetSubIds) {
          await tenantDb.questionPaperSubSection.update({
            where: { id: subId },
            data: { questionsToAttempt: 0 },
          }).catch(() => { })
        }
      } else {
        const attemptVal = input.questionsToAttempt ?? dist.questionsToAttempt ?? dist.questionCount ?? 0
        await tenantDb.questionPaperSubSection.update({
          where: { id: targetSubIds[0] },
          data: { questionsToAttempt: attemptVal },
        }).catch(() => { })
      }
    }
  }

  if (targetSecId) {
    const secSubs = await tenantDb.questionPaperSubSection.findMany({
      where: { sectionId: targetSecId },
      select: { questionsToAttempt: true },
    })

    const secAttemptSum = secSubs.reduce((sum, s) => sum + (s.questionsToAttempt || 0), 0)
    const finalSecAttempt = secAttemptSum > 0 ? secAttemptSum : (input.questionsToAttempt ?? input.questionCount)

    await tenantDb.questionPaperSection.update({
      where: { id: targetSecId },
      data: {
        questionsToAttempt: finalSecAttempt ?? undefined,
      },
    }).catch(() => { })
  }

  // Sync totals
  await syncTotals(tenantDb, subject.questionPaperId, subject.id)

  await logHistory(tenantDb, {
    questionPaperId: subject.questionPaperId,
    action: isNew ? "DISTRIBUTION_ADDED" : "DISTRIBUTION_UPDATED",
    actorId,
    changes: { distId: dist.id, typeName: dist.questionTypeName, totalMarks: dist.totalMarks },
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

export async function updateDistributionLabel(
  tenantDb: TenantPrismaClient,
  input: UpdateDistributionLabelInput,
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

  const updated = await tenantDb.questionPaperSubjectMarkDistribution.update({
    where: { id: input.id },
    data: {
      questionTypeLabel: input.questionTypeLabel,
    },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "DISTRIBUTION_UPDATED",
    actorId,
    changes: {
      distId: input.id,
      typeName: existing.questionTypeName,
      questionTypeLabel: input.questionTypeLabel,
    },
  })

  return updated
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

  const dist = await tenantDb.questionPaperSubjectMarkDistribution.findUnique({
    where: { id: input.distributionId },
  })

  const finalSectionId = input.sectionId ?? dist?.sectionId ?? null
  const finalSubSectionId = input.subSectionId ?? null

  // Create the junction row
  const paperQuestion = await tenantDb.questionPaperQuestion.create({
    data: {
      questionPaperId: input.questionPaperId,
      mcqId: input.mcqId,
      cqId: input.cqId,
      shortAnswerId: input.shortAnswerId,
      distributionId: input.distributionId,
      sectionId: finalSectionId,
      subSectionId: finalSubSectionId,
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
  } else if (input.questionType === "CS") {
    where.csId = input.questionId
  } else if (input.questionType === "SA") {
    where.shortAnswerId = input.questionId
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
    SA: "shortAnswerId",
    PARAGRAPH: "paragraphId",
    AMPLIFICATION: "amplificationId",
    LETTER: "letterId",
    APPLICATION: "applicationId",
    SUMMARY: "summaryId",
    ESSENCE: "essenceId",
    NEWS_REPORT: "newsReportId",
    ESSAY: "essayId",
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
    "mcqId", "cqId", "csId", "shortAnswerId", "paragraphId", "amplificationId",
    "letterId", "applicationId", "summaryId", "essenceId", "essayId"
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
        orderBy: { id: "asc" },
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

  // Count primary questions and alternative questions per distribution
  const countsByDist = new Map<string, number>()
  const altCountsByDist = new Map<string, number>()
  for (const q of paper.questions) {
    if (q.parentQuestionId) {
      const cur = altCountsByDist.get(q.distributionId) || 0
      altCountsByDist.set(q.distributionId, cur + 1)
    } else {
      const cur = countsByDist.get(q.distributionId) || 0
      countsByDist.set(q.distributionId, cur + 1)
    }
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
    alternativeCount: number
    marksPerQuestion: number
    markDistribution: any
    totalMarks: number
    status: "COMPLETED" | "ACTIVE" | "LOCKED" | "INCOMPLETE"
    sectionId: string | null
    subSectionId: string | null
    subSectionIds?: string[]
    questionType: any
  }> = []

  for (const sub of paper.subjects) {
    for (const dist of sub.distributions) {
      const addedCount = countsByDist.get(dist.id) || 0
      const altCount = altCountsByDist.get(dist.id) || 0
      const targetCount = dist.questionCount

      const isComplete = addedCount >= targetCount && targetCount > 0
      const status: "COMPLETED" | "ACTIVE" | "LOCKED" | "INCOMPLETE" = isComplete ? "COMPLETED" : "ACTIVE"

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
        alternativeCount: altCount,
        marksPerQuestion: dist.marksPerQuestion,
        markDistribution: dist.markDistribution || null,
        totalMarks: dist.totalMarks,
        status,
        sectionId: dist.sectionId || null,
        subSectionId: (dist as any).subSections?.[0]?.subSectionId || null,
        subSectionIds: (dist as any).subSections?.map((s: any) => s.subSectionId) || [],
        questionType: qTypeMap.get(dist.questionTypeId) || null,
      })
    }
  }

  return statuses
}

// ---------------------------------------------------------------------------
// Available Questions — Category Registry Config
// ---------------------------------------------------------------------------

type CategoryQueryConfig = {
  model: string
  searchFields: string[]
  includes: Record<string, boolean>
  excludedIdField: string
  hasIsActive: boolean
  fallbackWithoutTypeFilter?: boolean
}

const CATEGORY_QUERY_CONFIG: Record<string, CategoryQueryConfig> = {
  MCQ: {
    model: "mcq",
    searchFields: ["question"],
    includes: { chapter: true, questionType: true, attachments: true },
    excludedIdField: "mcqId",
    hasIsActive: true,
  },
  CQ: {
    model: "cq",
    searchFields: ["questionA", "questionB", "context"],
    includes: { chapter: true, questionType: true, answer: true, attachments: true },
    excludedIdField: "cqId",
    hasIsActive: true,
  },
  CS: {
    model: "cS",
    searchFields: ["questionA", "questionB"],
    includes: { chapter: true, questionType: true },
    excludedIdField: "csId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  SA: {
    model: "shortAnswer",
    searchFields: ["question"],
    includes: { chapter: true, questionType: true, attachments: true },
    excludedIdField: "shortAnswerId",
    hasIsActive: true,
  },
  PARAGRAPH: {
    model: "paragraph",
    searchFields: ["name"],
    includes: { chapter: true, questionType: true },
    excludedIdField: "paragraphId",
    hasIsActive: false,
  },
  AMPLIFICATION: {
    model: "amplification",
    searchFields: ["title"],
    includes: { chapter: true, questionType: true },
    excludedIdField: "amplificationId",
    hasIsActive: false,
  },
  LETTER: {
    model: "letter",
    searchFields: ["title"],
    includes: { questionType: true },
    excludedIdField: "letterId",
    hasIsActive: false,
    fallbackWithoutTypeFilter: true,
  },
  APPLICATION: {
    model: "application",
    searchFields: ["title"],
    includes: { questionType: true },
    excludedIdField: "applicationId",
    hasIsActive: false,
    fallbackWithoutTypeFilter: true,
  },
  SUMMARY: {
    model: "summary",
    searchFields: ["title"],
    includes: { questionType: true },
    excludedIdField: "summaryId",
    hasIsActive: false,
    fallbackWithoutTypeFilter: true,
  },
  ESSENCE: {
    model: "essence",
    searchFields: ["title"],
    includes: { questionType: true },
    excludedIdField: "essenceId",
    hasIsActive: false,
    fallbackWithoutTypeFilter: true,
  },
  NEWS_REPORT: {
    model: "newsReport",
    searchFields: ["title"],
    includes: { questionType: true },
    excludedIdField: "newsReportId",
    hasIsActive: false,
    fallbackWithoutTypeFilter: true,
  },
  ESSAY: {
    model: "essay",
    searchFields: ["title"],
    includes: { questionType: true },
    excludedIdField: "essayId",
    hasIsActive: false,
    fallbackWithoutTypeFilter: true,
  },
}

// Normalized name → category code mapping for auto-detection
const NORMALIZED_TO_CATEGORY: Record<string, string> = {
  [QUESTION_TYPES.MCQ]: "MCQ",
  [QUESTION_TYPES.CQ]: "CQ",
  [QUESTION_TYPES.CS]: "CS",
  [QUESTION_TYPES.SA]: "SA",
  [QUESTION_TYPES.PARAGRAPH]: "PARAGRAPH",
  [QUESTION_TYPES.THOUGHT_EXPANSION]: "AMPLIFICATION",
  [QUESTION_TYPES.LETTER]: "LETTER",
  [QUESTION_TYPES.APPLICATION]: "APPLICATION",
  [QUESTION_TYPES.SUMMARY]: "SUMMARY",
  [QUESTION_TYPES.ESSENCE]: "ESSENCE",
  [QUESTION_TYPES.NEWS_REPORT]: "NEWS_REPORT",
  [QUESTION_TYPES.ESSAY]: "ESSAY",
}

export async function getAvailableQuestions(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: GetAvailableQuestionsInput
) {
  const { subjectId, chapterId, questionTypeId, category, difficulty, search, board, year, excludePaperId, limit, cursor } = input
  console.log(category)

  // 1. Build exclusion set and resolve category in parallel
  const exclusionPromise = excludePaperId
    ? tenantDb.questionPaperQuestion.findMany({
      where: { questionPaperId: excludePaperId },
      select: {
        mcqId: true,
        cqId: true,
        csId: true,
        shortAnswerId: true,
        paragraphId: true,
        amplificationId: true,
        letterId: true,
        applicationId: true,
        summaryId: true,
        essenceId: true,
        essayId: true,
        newsReportId: true,
      },
    })
    : Promise.resolve([])

  const categoryPromise = (async () => {
    let effectiveCategory = category
    if ((!effectiveCategory || effectiveCategory === QUESTION_TYPE_CODES.MCQ) && questionTypeId && questionTypeId !== "all" && questionTypeId !== "All") {
      const qt = await db.questionType.findUnique({ where: { id: questionTypeId }, select: { nameEn: true, nameBn: true, label: true } })
      if (qt) {
        const normalized = normalizeQuestionTypeName(qt.nameEn) || normalizeQuestionTypeName(qt.nameBn) || normalizeQuestionTypeName(qt.label)
        if (normalized && NORMALIZED_TO_CATEGORY[normalized]) {
          effectiveCategory = NORMALIZED_TO_CATEGORY[normalized] as typeof effectiveCategory
        }
      }
    }
    return effectiveCategory || "MCQ"
  })()

  const [existingQuestions, effectiveCategory] = await Promise.all([exclusionPromise, categoryPromise])

  // Build excluded IDs map by field
  const excludedIds = new Map<string, Set<string>>()
  for (const q of existingQuestions) {
    for (const [field, value] of Object.entries(q)) {
      if (value) {
        if (!excludedIds.has(field)) excludedIds.set(field, new Set())
        excludedIds.get(field)!.add(value as string)
      }
    }
  }

  // 2. Look up config for this category
  const config = CATEGORY_QUERY_CONFIG[effectiveCategory] || CATEGORY_QUERY_CONFIG.MCQ!

  // 3. Build common where clause
  const whereCommon: any = { subjectId }
  if (config.hasIsActive) whereCommon.isActive = true
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

  const where: any = { ...whereCommon }

  if (["APPLICATION", "LETTER", "SUMMARY", "ESSENCE", "NEWS_REPORT", "ESSAY"].includes(effectiveCategory)) {
    delete where.chapterId
    delete where.source
    delete where.year
  }

  if (effectiveCategory === "APPLICATION" || effectiveCategory === "LETTER") {
    if (questionTypeId && questionTypeId !== "all" && questionTypeId !== "All") {
      const matchWord = effectiveCategory === "APPLICATION" ? "app" : "letter"
      const matchWordBn = effectiveCategory === "APPLICATION" ? "আবেদন" : "পত্র"
      const altWordBn = effectiveCategory === "APPLICATION" ? "দরখাস্ত" : "চিঠি"
      const relatedQts = await db.questionType.findMany({
        where: {
          OR: [
            { nameEn: { contains: matchWord, mode: "insensitive" } },
            { nameBn: { contains: matchWordBn } },
            { nameBn: { contains: altWordBn } },
          ],
        },
        select: { id: true },
      })
      const relatedIds = relatedQts.map((q) => q.id)
      relatedIds.push(questionTypeId)
      where.questionTypeId = { in: Array.from(new Set(relatedIds)) }
    }
  } else if (questionTypeId && questionTypeId !== "all" && questionTypeId !== "All") {
    where.questionTypeId = questionTypeId
  }

  // 4. Build search filter
  if (search && search.trim()) {
    const trimmed = search.trim()
    if (config.searchFields.length === 1) {
      where[config.searchFields[0]!] = { contains: trimmed, mode: "insensitive" }
    } else {
      where.OR = config.searchFields.map((field) => ({
        [field]: { contains: trimmed, mode: "insensitive" },
      }))
    }
  }

  // 5. Execute query using the config model
  const model = (db as any)[config.model]
  let items = await model.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    include: config.includes,
    orderBy: { createdAt: "desc" },
  })

  // CS-specific fallback: retry without questionTypeId filter if no results
  if (items.length === 0 && config.fallbackWithoutTypeFilter && where.questionTypeId) {
    delete where.questionTypeId
    items = await model.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: config.includes,
      orderBy: { createdAt: "desc" },
    })
  }

  // 6. Paginate and enrich with isAssigned flag
  const hasNext = items.length > limit
  const paginatedItems = hasNext ? items.slice(0, limit) : items
  const nextCursor = hasNext ? paginatedItems[paginatedItems.length - 1]?.id : undefined
  const excludedSet = excludedIds.get(config.excludedIdField) || new Set()

  return {
    category: effectiveCategory,
    items: paginatedItems.map((item: any) => ({
      ...item,
      isAssigned: excludedSet.has(item.id),
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
      }
    }

    let whereCondition: any = {};
    if (record.mcqId) {
      whereCondition = { questionPaperId_mcqId: { questionPaperId: input.questionPaperId, mcqId: record.mcqId } };
    } else if (record.cqId) {
      whereCondition = { questionPaperId_cqId: { questionPaperId: input.questionPaperId, cqId: record.cqId } };
    } else if (record.csId) {
      whereCondition = { questionPaperId_csId: { questionPaperId: input.questionPaperId, csId: record.csId } };
    } else if (record.shortAnswerId) {
      whereCondition = { questionPaperId_shortAnswerId: { questionPaperId: input.questionPaperId, shortAnswerId: record.shortAnswerId } };
    } else if (record.paragraphId) {
      whereCondition = { questionPaperId_paragraphId: { questionPaperId: input.questionPaperId, paragraphId: record.paragraphId } };
    } else if (record.amplificationId) {
      whereCondition = { questionPaperId_amplificationId: { questionPaperId: input.questionPaperId, amplificationId: record.amplificationId } };
    } else if (record.letterId) {
      whereCondition = { questionPaperId_letterId: { questionPaperId: input.questionPaperId, letterId: record.letterId } };
    } else if (record.applicationId) {
      whereCondition = { questionPaperId_applicationId: { questionPaperId: input.questionPaperId, applicationId: record.applicationId } };
    } else if (record.summaryId) {
      whereCondition = { questionPaperId_summaryId: { questionPaperId: input.questionPaperId, summaryId: record.summaryId } };
    } else if (record.essenceId) {
      whereCondition = { questionPaperId_essenceId: { questionPaperId: input.questionPaperId, essenceId: record.essenceId } };
    } else if (record.essayId) {
      whereCondition = { questionPaperId_essayId: { questionPaperId: input.questionPaperId, essayId: record.essayId } };
    } else if (record.newsReportId) {
      whereCondition = { questionPaperId_newsReportId: { questionPaperId: input.questionPaperId, newsReportId: record.newsReportId } };
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
            markDistribution: (dist.markDistribution as any) ?? undefined,
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

        const createdPrimary = await tenantDb.questionPaperQuestion.create({
          data: {
            questionPaperId: createdPaper.id,
            mcqId: q.mcqId,
            cqId: q.cqId,
            csId: q.csId,
            shortAnswerId: q.shortAnswerId,
            paragraphId: q.paragraphId,
            amplificationId: q.amplificationId,
            letterId: q.letterId,
            applicationId: q.applicationId,
            summaryId: q.summaryId,
            essenceId: q.essenceId,
            essayId: q.essayId,
            newsReportId: q.newsReportId,
            distributionId: newDistId,
            sectionId: newSecId,
            orderIndex: globalOrder++,
            assignedMarks: q.assignedMarks,
            overrides,
            contentSnapshot: q.contentSnapshot ?? null,
          },
        })

        if (q.alternatives && q.alternatives.length > 0) {
          for (const alt of q.alternatives) {
            const altDistId = distMap.get(alt.distributionId) || newDistId
            await tenantDb.questionPaperQuestion.create({
              data: {
                questionPaperId: createdPaper.id,
                parentQuestionId: createdPrimary.id,
                mcqId: alt.mcqId,
                cqId: alt.cqId,
                csId: alt.csId,
                shortAnswerId: alt.shortAnswerId,
                paragraphId: alt.paragraphId,
                amplificationId: alt.amplificationId,
                letterId: alt.letterId,
                applicationId: alt.applicationId,
                summaryId: alt.summaryId,
                essenceId: alt.essenceId,
                essayId: alt.essayId,
                newsReportId: alt.newsReportId,
                distributionId: altDistId,
                sectionId: newSecId,
                orderIndex: createdPrimary.orderIndex,
                assignedMarks: alt.assignedMarks,
                orLabel: alt.orLabel || "অথবা",
                orOrder: alt.orOrder,
                contentSnapshot: alt.contentSnapshot ?? null,
              },
            })
          }
        }
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

