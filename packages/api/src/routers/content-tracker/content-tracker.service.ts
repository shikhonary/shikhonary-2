import type { PrismaClient } from "@workspace/db/main"
import type {
  GetGlobalSummaryInput,
  GetSubjectPipelineInput,
  GetMissingAttachmentsInput,
  UpdateAttachmentUrlInput,
  ToggleQuestionActiveInput,
  GetQualityQueueInput,
  ResolveReportInput,
} from "./content-tracker.schema"

export async function getGlobalSummary(
  db: PrismaClient,
  input: GetGlobalSummaryInput,
) {
  const [
    subjects,
    totalMcq,
    activeMcq,
    totalCq,
    activeCq,
    totalSa,
    activeSa,
    totalVisualAttachments,
    uploadedVisualAttachments,
    totalTables,
    pendingReports,
    resolvedReports,
    missingImageReports,
    contentErrorReports,
  ] = await Promise.all([
    db.academicSubject.findMany({
      where: input.classId
        ? { classSubjects: { some: { classId: input.classId } } }
        : undefined,
      include: {
        classSubjects: {
          include: {
            academicClass: true,
          },
        },
        chapters: {
          select: { id: true },
        },
        _count: {
          select: {
            mcqs: true,
            cqs: true,
            shortAnswers: true,
          },
        },
      },
      orderBy: { nameEn: "asc" },
    }),
    db.mcq.count(),
    db.mcq.count({ where: { isActive: true } }),
    db.cq.count(),
    db.cq.count({ where: { isActive: true } }),
    db.shortAnswer.count(),
    db.shortAnswer.count({ where: { isActive: true } }),
    db.questionAttachment.count({
      where: { type: { in: ["DIAGRAM", "IMAGE", "CHART", "MAP"] } },
    }),
    db.questionAttachment.count({
      where: {
        type: { in: ["DIAGRAM", "IMAGE", "CHART", "MAP"] },
        url: { not: null },
      },
    }),
    db.questionAttachment.count({
      where: { type: "TABLE" },
    }),
    db.questionReport.count({ where: { status: "PENDING" } }),
    db.questionReport.count({ where: { status: "RESOLVED" } }),
    db.questionReport.count({
      where: { reportType: "MISSING_IMAGE", status: "PENDING" },
    }),
    db.questionReport.count({
      where: { reportType: "CONTENT_ERROR", status: "PENDING" },
    }),
  ])

  const totalQuestions = totalMcq + totalCq + totalSa
  const totalActive = activeMcq + activeCq + activeSa
  const totalInactive = totalQuestions - totalActive
  const activePercentage =
    totalQuestions > 0 ? Math.round((totalActive / totalQuestions) * 100) : 100

  const missingVisualAttachments =
    totalVisualAttachments - uploadedVisualAttachments
  const attachmentProgressPercentage =
    totalVisualAttachments > 0
      ? Math.round((uploadedVisualAttachments / totalVisualAttachments) * 100)
      : 100

  const subjectOptions = subjects.map((s) => ({
    id: s.id,
    nameBn: s.nameBn,
    nameEn: s.nameEn,
    code: s.code,
    group: s.group,
    classNames: s.classSubjects
      .map((cs) => cs.academicClass.nameBn)
      .join(", "),
    chapterCount: s.chapters.length,
    totalQuestions: s._count.mcqs + s._count.cqs + s._count.shortAnswers,
    mcqCount: s._count.mcqs,
    cqCount: s._count.cqs,
    shortAnswerCount: s._count.shortAnswers,
  }))

  return {
    metrics: {
      totalQuestions,
      totalActive,
      totalInactive,
      activePercentage,
      totalMcq,
      totalCq,
      totalSa,
      totalVisualAttachments,
      uploadedVisualAttachments,
      missingVisualAttachments,
      attachmentProgressPercentage,
      totalTables,
      pendingReports,
      resolvedReports,
      missingImageReports,
      contentErrorReports,
    },
    subjects: subjectOptions,
  }
}

export async function getSubjectPipeline(
  db: PrismaClient,
  input: GetSubjectPipelineInput,
) {
  const subject = await db.academicSubject.findUnique({
    where: { id: input.subjectId },
    include: {
      classSubjects: {
        include: { academicClass: true },
      },
      chapters: {
        orderBy: { position: "asc" },
      },
    },
  })

  if (!subject) {
    throw new Error(`Subject not found for ID: ${input.subjectId}`)
  }

  const [
    mcqAll,
    mcqActive,
    cqAll,
    cqActive,
    saAll,
    saActive,
    attachments,
    pendingReports,
    mcqQuestions,
    cqQuestions,
    saQuestions,
  ] = await Promise.all([
    db.mcq.groupBy({
      by: ["chapterId"],
      where: { subjectId: input.subjectId },
      _count: { id: true },
    }),
    db.mcq.groupBy({
      by: ["chapterId"],
      where: { subjectId: input.subjectId, isActive: true },
      _count: { id: true },
    }),
    db.cq.groupBy({
      by: ["chapterId"],
      where: { subjectId: input.subjectId },
      _count: { id: true },
    }),
    db.cq.groupBy({
      by: ["chapterId"],
      where: { subjectId: input.subjectId, isActive: true },
      _count: { id: true },
    }),
    db.shortAnswer.groupBy({
      by: ["chapterId"],
      where: { subjectId: input.subjectId },
      _count: { id: true },
    }),
    db.shortAnswer.groupBy({
      by: ["chapterId"],
      where: { subjectId: input.subjectId, isActive: true },
      _count: { id: true },
    }),
    db.questionAttachment.findMany({
      where: {
        OR: [
          { mcq: { subjectId: input.subjectId } },
          { cq: { subjectId: input.subjectId } },
          { shortAnswer: { subjectId: input.subjectId } },
        ],
      },
      select: {
        id: true,
        type: true,
        url: true,
        table: true,
        mcq: { select: { chapterId: true } },
        cq: { select: { chapterId: true } },
        shortAnswer: { select: { chapterId: true } },
      },
    }),
    db.questionReport.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        entityType: true,
        entityId: true,
        reportType: true,
        description: true,
      },
    }),
    db.mcq.findMany({
      where: { subjectId: input.subjectId },
      select: { id: true, chapterId: true },
    }),
    db.cq.findMany({
      where: { subjectId: input.subjectId },
      select: { id: true, chapterId: true },
    }),
    db.shortAnswer.findMany({
      where: { subjectId: input.subjectId },
      select: { id: true, chapterId: true },
    }),
  ])

  // Build question-to-chapter index for fast report attribution
  const entityChapterMap = new Map<string, string>()
  for (const q of mcqQuestions) entityChapterMap.set(q.id, q.chapterId)
  for (const q of cqQuestions) entityChapterMap.set(q.id, q.chapterId)
  for (const q of saQuestions) entityChapterMap.set(q.id, q.chapterId)

  // Map pending reports to chapters
  const chapterReportCount = new Map<string, number>()
  let subjectPendingReports = 0
  for (const rep of pendingReports) {
    const chId = entityChapterMap.get(rep.entityId)
    if (chId) {
      chapterReportCount.set(chId, (chapterReportCount.get(chId) ?? 0) + 1)
      subjectPendingReports++
    }
  }

  // Chapter matrix
  let totalSubjectQuestions = 0
  let totalSubjectActive = 0
  let totalSubjectVisual = 0
  let totalSubjectUploadedVisual = 0
  let totalSubjectTables = 0

  const chaptersData = subject.chapters.map((ch) => {
    const mcq = mcqAll.find((m) => m.chapterId === ch.id)?._count.id ?? 0
    const mcqAct = mcqActive.find((m) => m.chapterId === ch.id)?._count.id ?? 0
    const cq = cqAll.find((c) => c.chapterId === ch.id)?._count.id ?? 0
    const cqAct = cqActive.find((c) => c.chapterId === ch.id)?._count.id ?? 0
    const sa = saAll.find((s) => s.chapterId === ch.id)?._count.id ?? 0
    const saAct = saActive.find((s) => s.chapterId === ch.id)?._count.id ?? 0

    const totalQ = mcq + cq + sa
    const activeQ = mcqAct + cqAct + saAct
    const inactiveQ = totalQ - activeQ

    totalSubjectQuestions += totalQ
    totalSubjectActive += activeQ

    // Chapter attachments
    const chAtts = attachments.filter(
      (a) =>
        a.mcq?.chapterId === ch.id ||
        a.cq?.chapterId === ch.id ||
        a.shortAnswer?.chapterId === ch.id,
    )

    const visualAtts = chAtts.filter((a) =>
      ["DIAGRAM", "IMAGE", "CHART", "MAP"].includes(a.type),
    )
    const uploadedVisual = visualAtts.filter(
      (a) => a.url && a.url.trim().length > 0,
    ).length
    const missingVisual = visualAtts.length - uploadedVisual
    const tableAtts = chAtts.filter(
      (a) => a.type === "TABLE" || Boolean(a.table),
    ).length

    totalSubjectVisual += visualAtts.length
    totalSubjectUploadedVisual += uploadedVisual
    totalSubjectTables += tableAtts

    const reportsCount = chapterReportCount.get(ch.id) ?? 0

    // Determine status badge
    let statusBadge: "READY" | "MISSING_ATTACHMENTS" | "NEEDS_REVIEW" | "EMPTY"
    if (totalQ === 0) {
      statusBadge = "EMPTY"
    } else if (missingVisual > 0) {
      statusBadge = "MISSING_ATTACHMENTS"
    } else if (reportsCount > 0 || inactiveQ > 0) {
      statusBadge = "NEEDS_REVIEW"
    } else {
      statusBadge = "READY"
    }

    // Readiness score calculation
    let readinessScore = 0
    if (totalQ > 0) {
      const visualScore =
        visualAtts.length === 0
          ? 100
          : Math.round((uploadedVisual / visualAtts.length) * 100)
      const activeScore = Math.round((activeQ / totalQ) * 100)
      readinessScore = Math.round(0.4 * visualScore + 0.6 * activeScore)
    }

    return {
      id: ch.id,
      nameBn: ch.nameBn,
      nameEn: ch.nameEn,
      position: ch.position,
      totalQuestions: totalQ,
      activeQuestions: activeQ,
      inactiveQuestions: inactiveQ,
      mcqCount: mcq,
      cqCount: cq,
      shortAnswerCount: sa,
      visualAttachmentsCount: visualAtts.length,
      uploadedVisualCount: uploadedVisual,
      missingVisualCount: missingVisual,
      tableCount: tableAtts,
      pendingReportsCount: reportsCount,
      statusBadge,
      readinessScore,
    }
  })

  const totalSubjectMissingVisual =
    totalSubjectVisual - totalSubjectUploadedVisual
  const totalSubjectInactive = totalSubjectQuestions - totalSubjectActive
  const activeRate =
    totalSubjectQuestions > 0
      ? Math.round((totalSubjectActive / totalSubjectQuestions) * 100)
      : 100
  const attachmentRate =
    totalSubjectVisual > 0
      ? Math.round((totalSubjectUploadedVisual / totalSubjectVisual) * 100)
      : 100

  return {
    subject: {
      id: subject.id,
      nameBn: subject.nameBn,
      nameEn: subject.nameEn,
      code: subject.code,
      group: subject.group,
      classNames: subject.classSubjects
        .map((cs) => cs.academicClass.nameBn)
        .join(", "),
    },
    summary: {
      totalChapters: subject.chapters.length,
      totalQuestions: totalSubjectQuestions,
      totalActive: totalSubjectActive,
      totalInactive: totalSubjectInactive,
      activeRate,
      totalVisual: totalSubjectVisual,
      uploadedVisual: totalSubjectUploadedVisual,
      missingVisual: totalSubjectMissingVisual,
      attachmentRate,
      totalTables: totalSubjectTables,
      pendingReports: subjectPendingReports,
    },
    chapters: chaptersData,
  }
}

export async function getMissingAttachments(
  db: PrismaClient,
  input: GetMissingAttachmentsInput,
) {
  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const visualTypes =
    input.type === "ALL" || !input.type
      ? ["DIAGRAM", "IMAGE", "CHART", "MAP"]
      : [input.type]

  const whereConditions: any[] = [
    { type: { in: visualTypes } },
    {
      OR: [{ url: null }, { url: "" }],
    },
  ]

  if (input.subjectId) {
    whereConditions.push({
      OR: [
        { mcq: { subjectId: input.subjectId } },
        { cq: { subjectId: input.subjectId } },
        { shortAnswer: { subjectId: input.subjectId } },
        { cs: { subjectId: input.subjectId } },
        { descriptiveQuestion: { subjectId: input.subjectId } },
      ],
    })
  }

  if (input.chapterId) {
    whereConditions.push({
      OR: [
        { mcq: { chapterId: input.chapterId } },
        { cq: { chapterId: input.chapterId } },
        { shortAnswer: { chapterId: input.chapterId } },
        { cs: { chapterId: input.chapterId } },
        { descriptiveQuestion: { chapterId: input.chapterId } },
      ],
    })
  }

  if (input.search && input.search.trim()) {
    const s = input.search.trim()
    whereConditions.push({
      OR: [
        { caption: { contains: s, mode: "insensitive" } },
        { mcq: { question: { contains: s, mode: "insensitive" } } },
        { cq: { questionA: { contains: s, mode: "insensitive" } } },
        { cq: { context: { contains: s, mode: "insensitive" } } },
        { shortAnswer: { question: { contains: s, mode: "insensitive" } } },
      ],
    })
  }

  const where = { AND: whereConditions }

  const [total, items] = await Promise.all([
    db.questionAttachment.count({ where }),
    db.questionAttachment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        mcq: {
          include: {
            chapter: true,
            subject: true,
          },
        },
        cq: {
          include: {
            chapter: true,
            subject: true,
          },
        },
        shortAnswer: {
          include: {
            chapter: true,
            subject: true,
          },
        },
      },
    }),
  ])

  const formattedItems = items.map((att) => {
    let parentType = "UNKNOWN"
    let parentId = ""
    let questionStem = ""
    let context: string | null = null
    let reference: string[] = []
    let isMath = false
    let chapter: { id: string; nameBn: string; nameEn: string } | null = null
    let subject: { id: string; nameBn: string; nameEn: string } | null = null

    if (att.mcq) {
      parentType = "MCQ"
      parentId = att.mcq.id
      questionStem = att.mcq.question
      reference = att.mcq.reference
      isMath = att.mcq.isMath
      chapter = att.mcq.chapter
      subject = att.mcq.subject
    } else if (att.cq) {
      parentType = "CQ"
      parentId = att.cq.id
      questionStem = att.cq.questionA
      context = att.cq.context
      reference = att.cq.reference
      chapter = att.cq.chapter
      subject = att.cq.subject
    } else if (att.shortAnswer) {
      parentType = "SHORT_ANSWER"
      parentId = att.shortAnswer.id
      questionStem = att.shortAnswer.question
      reference = att.shortAnswer.reference
      isMath = att.shortAnswer.isMath
      chapter = att.shortAnswer.chapter
      subject = att.shortAnswer.subject
    }

    return {
      id: att.id,
      type: att.type,
      caption: att.caption,
      url: att.url,
      position: att.position,
      parentType,
      parentId,
      questionStem,
      context,
      reference,
      isMath,
      chapter,
      subject,
      createdAt: att.createdAt,
    }
  })

  return {
    items: formattedItems,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function updateAttachmentUrl(
  db: PrismaClient,
  input: UpdateAttachmentUrlInput,
) {
  const updated = await db.questionAttachment.update({
    where: { id: input.attachmentId },
    data: {
      url: input.url,
      caption: input.caption !== undefined ? input.caption : undefined,
    },
  })

  const parentId =
    updated.mcqId ||
    updated.cqId ||
    updated.shortAnswerId ||
    updated.csId ||
    updated.descriptiveQuestionId ||
    updated.shortQuestionId

  if (parentId) {
    await db.questionReport.updateMany({
      where: {
        entityId: parentId,
        reportType: "MISSING_IMAGE",
        status: "PENDING",
      },
      data: {
        status: "RESOLVED",
        resolvedNote: `Asset URL linked: ${input.url}`,
        resolvedAt: new Date(),
      },
    })
  }

  return updated
}

export async function toggleQuestionActive(
  db: PrismaClient,
  input: ToggleQuestionActiveInput,
  userId?: string,
) {
  // 1. Update isActive on the target question model
  switch (input.entityType) {
    case "MCQ":
      await db.mcq.update({
        where: { id: input.entityId },
        data: { isActive: input.isActive },
      })
      break
    case "CQ":
      await db.cq.update({
        where: { id: input.entityId },
        data: { isActive: input.isActive },
      })
      break
    case "SHORT_ANSWER":
      await db.shortAnswer.update({
        where: { id: input.entityId },
        data: { isActive: input.isActive },
      })
      break
    case "PBQ":
      await db.pBQ.update({
        where: { id: input.entityId },
        data: { isActive: input.isActive },
      })
      break
    case "DESCRIPTIVE_QUESTION":
      await db.descriptiveQuestion.update({
        where: { id: input.entityId },
        data: { isActive: input.isActive },
      })
      break
    case "CS":
      await db.cS.update({
        where: { id: input.entityId },
        data: { isActive: input.isActive },
      })
      break
    case "SHORT_QUESTION":
      await db.shortQuestion.update({
        where: { id: input.entityId },
        data: { isActive: input.isActive },
      })
      break
  }

  // 2. Report handling:
  // If deactivated and note is provided, log an issue report
  if (!input.isActive && input.note) {
    await db.questionReport.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        reportType: "CONTENT_ERROR",
        description: input.note,
        status: "PENDING",
        reportedById: userId ?? null,
      },
    })
  }

  // If activated, resolve any open reports for this question
  if (input.isActive) {
    await db.questionReport.updateMany({
      where: {
        entityId: input.entityId,
        status: "PENDING",
      },
      data: {
        status: "RESOLVED",
        resolvedNote:
          input.note || "Verified and published during content proofing",
        resolvedById: userId ?? null,
        resolvedAt: new Date(),
      },
    })
  }

  return { success: true, isActive: input.isActive }
}

export async function getQualityQueue(
  db: PrismaClient,
  input: GetQualityQueueInput,
) {
  const page = input.page ?? 1
  const limit = input.limit ?? 15
  const skip = (page - 1) * limit
  const take = limit

  // Currently focusing on MCQs and CQs in the Quality Queue
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId

  if (input.filter === "INACTIVE") {
    where.isActive = false
  }

  if (input.search && input.search.trim()) {
    where.OR = [
      { question: { contains: input.search.trim(), mode: "insensitive" } },
      { reference: { has: input.search.trim() } },
    ]
  }

  const [total, mcqs] = await Promise.all([
    db.mcq.count({ where }),
    db.mcq.findMany({
      where,
      skip,
      take,
      orderBy: [{ isActive: "asc" }, { updatedAt: "desc" }],
      include: {
        chapter: { select: { id: true, nameBn: true, nameEn: true } },
        subject: { select: { id: true, nameBn: true, nameEn: true } },
        attachments: {
          orderBy: { position: "asc" },
        },
      },
    }),
  ])

  // Get reports for these questions
  const mcqIds = mcqs.map((m) => m.id)
  const reports = await db.questionReport.findMany({
    where: {
      entityId: { in: mcqIds },
      status: "PENDING",
    },
  })

  const items = mcqs.map((m) => ({
    id: m.id,
    entityType: "MCQ" as const,
    question: m.question,
    options: m.options,
    answer: m.answer,
    statements: m.statements,
    type: m.type,
    isMath: m.isMath,
    reference: m.reference,
    isActive: m.isActive,
    chapter: m.chapter,
    subject: m.subject,
    attachments: m.attachments,
    pendingReports: reports.filter((r) => r.entityId === m.id),
  }))

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function resolveReport(
  db: PrismaClient,
  input: ResolveReportInput,
  userId?: string,
) {
  const updated = await db.questionReport.update({
    where: { id: input.reportId },
    data: {
      status: "RESOLVED",
      resolvedNote: input.resolvedNote,
      resolvedById: userId ?? null,
      resolvedAt: new Date(),
    },
  })

  return updated
}
