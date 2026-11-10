import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import { categorizeReference, isIgnoredReference } from "@workspace/utils"
import type {
  CreateCsInput,
  DeleteCsInput,
  GetCsInput,
  ListCsInput,
  UpdateCsInput,
  BulkDeleteCsInput,
  ToggleCsActiveInput,
  ImportCsInput,
  CsStatsInput,
  ResolveCsReportInput,
  AssignCsReportInput,
} from "./cs.schema"

export async function listCs(db: PrismaClient, input: ListCsInput) {
  const where: any = {}

  if (input.subjectId && input.subjectId !== "All") where.subjectId = input.subjectId
  if (input.chapterId && input.chapterId !== "All") where.chapterId = input.chapterId
  if (input.difficulty && input.difficulty !== "All") where.difficulty = input.difficulty
  if (input.source && input.source !== "All") where.source = input.source
  if (input.session && input.session !== "All") where.session = input.session

  if (input.isActive !== undefined && input.isActive !== "All") {
    if (typeof input.isActive === "boolean") {
      where.isActive = input.isActive
    } else if (input.isActive === "true" || input.isActive === "ACTIVE") {
      where.isActive = true
    } else if (input.isActive === "false" || input.isActive === "INACTIVE") {
      where.isActive = false
    }
  }

  if (input.hasReport !== undefined && input.hasReport !== "All") {
    const isReported = input.hasReport === true || input.hasReport === "YES" || input.hasReport === "true"
    const reports = await (db as any).questionReport.findMany({
      where: { entityType: "CS", status: { in: ["PENDING", "ASSIGNED"] } },
      select: { entityId: true },
      distinct: ["entityId"],
    })
    const reportedIds = reports.map((r: any) => r.entityId)
    if (isReported) {
      where.id = { in: reportedIds }
    } else {
      where.id = { notIn: reportedIds }
    }
  }

  if (input.board && input.board !== "All") {
    if (input.board === "SCHOOL_ALL") {
      const questionsWithRef = await (db as any).cS.findMany({
        where: {
          NOT: { reference: { equals: [] } },
          ...(where.subjectId ? { subjectId: where.subjectId } : {}),
          ...(where.chapterId ? { chapterId: where.chapterId } : {}),
        },
        select: { reference: true },
      })
      const schoolRefs = new Set<string>()
      for (const q of questionsWithRef) {
        for (const ref of q.reference || []) {
          if (!ref || isIgnoredReference(ref)) continue
          if (categorizeReference(ref) === "SCHOOL") {
            schoolRefs.add(ref)
          }
        }
      }
      if (schoolRefs.size > 0) {
        where.reference = { hasSome: Array.from(schoolRefs) }
      } else {
        where.id = "__NO_MATCHING_SCHOOL_CS__"
      }
    } else {
      where.reference = { has: input.board }
    }
  }

  if (input.query) {
    where.OR = [
      { questionA: { contains: input.query, mode: "insensitive" } },
      { questionB: { contains: input.query, mode: "insensitive" } },
      { source: { contains: input.query, mode: "insensitive" } },
      { session: { contains: input.query, mode: "insensitive" } },
      { reference: { has: input.query } },
      {
        attachments: {
          some: {
            OR: [
              { content: { contains: input.query, mode: "insensitive" } },
              { caption: { contains: input.query, mode: "insensitive" } },
              { bottomContent: { contains: input.query, mode: "insensitive" } },
            ],
          },
        },
      },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (input.sort === "newest") {
    orderBy = { createdAt: "desc" }
  } else if (input.sort === "oldest") {
    orderBy = { createdAt: "asc" }
  } else if (input.sort === "question_asc") {
    orderBy = { questionA: "asc" }
  } else if (input.sort === "question_desc") {
    orderBy = { questionA: "desc" }
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = (page - 1) * limit

  const [items, totalItems] = await Promise.all([
    (db as any).cS.findMany({
      where,
      take: limit,
      skip,
      orderBy,
      include: {
        subject: {
          select: {
            id: true,
            nameBn: true,
            nameEn: true,
            code: true,
            group: true,
            classSubjects: {
              select: {
                academicClass: {
                  select: {
                    id: true,
                    nameBn: true,
                    nameEn: true,
                  },
                },
              },
            },
          },
        },
        chapter: {
          select: {
            id: true,
            nameBn: true,
            nameEn: true,
            position: true,
          },
        },
        questionType: {
          select: {
            id: true,
            nameBn: true,
            nameEn: true,
            label: true,
            mark: true,
          },
        },
        attachments: {
          orderBy: {
            position: "asc",
          },
        },
      },
    }),
    (db as any).cS.count({ where }),
  ])

  const itemIds = items.map((it: any) => it.id)
  const itemReports =
    itemIds.length > 0
      ? await (db as any).questionReport.findMany({
          where: { entityType: "CS", entityId: { in: itemIds } },
          select: {
            id: true,
            entityId: true,
            status: true,
            reportType: true,
            description: true,
            resolvedNote: true,
            resolvedAt: true,
            createdAt: true,
            resolver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : []

  const reportMap = new Map<string, typeof itemReports>()
  for (const rep of itemReports) {
    if (!reportMap.has(rep.entityId)) reportMap.set(rep.entityId, [])
    reportMap.get(rep.entityId)!.push(rep)
  }

  const enhancedItems = items.map((item: any) => {
    const repList = reportMap.get(item.id) || []
    const hasActiveReport = repList.some((r: any) => r.status === "PENDING" || r.status === "ASSIGNED")
    return {
      ...item,
      hasReport: hasActiveReport,
      reports: repList,
    }
  })

  return {
    items: enhancedItems,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
  }
}

export async function getCsById(db: PrismaClient, input: GetCsInput) {
  const cs = await (db as any).cS.findUnique({
    where: { id: input.id },
    include: {
      subject: {
        include: {
          classSubjects: {
            include: {
              academicClass: true,
            },
          },
        },
      },
      chapter: true,
      questionType: true,
      attachments: {
        orderBy: {
          position: "asc",
        },
      },
    },
  })

  if (!cs) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `CS with ID ${input.id} not found`,
    })
  }

  return cs
}

export async function createCs(db: PrismaClient, input: CreateCsInput) {
  const { attachments, context, contextCaption, contextBottomContent, ...data } = input

  const allAttachments = Array.isArray(attachments) ? [...attachments] : []

  // If top-level context or captions are provided, ensure they are stored in QuestionAttachment
  const contextText = context?.trim() || null
  const captionText = contextCaption?.trim() || null
  const bottomText = contextBottomContent?.trim() || null

  const hasPassage = allAttachments.some(
    (a) => (a.type === "PASSAGE" || a.type === "text") && Boolean(a.content?.trim())
  )
  if ((contextText || captionText || bottomText) && !hasPassage) {
    allAttachments.unshift({
      type: "PASSAGE",
      content: contextText,
      caption: captionText,
      bottomContent: bottomText,
      position: 0,
    })
  }

  let resolvedQuestionTypeId = data.questionTypeId
  if (!resolvedQuestionTypeId) {
    const qt = await db.questionType.findFirst({
      where: {
        OR: [
          { label: { contains: "CS", mode: "insensitive" } },
          { nameEn: { contains: "CS", mode: "insensitive" } },
          { label: { contains: "Creative Short", mode: "insensitive" } },
          { nameEn: { contains: "Creative Short", mode: "insensitive" } },
          { label: { contains: "Creative Scenario", mode: "insensitive" } },
          { nameEn: { contains: "Creative Scenario", mode: "insensitive" } },
        ],
        isActive: true,
        subjects: {
          some: {
            subjectId: data.subjectId,
          },
        },
      },
      select: { id: true },
    })
    if (qt) {
      resolvedQuestionTypeId = qt.id
    } else {
      const defaultCsQt = await db.questionType.findFirst({
        where: {
          OR: [
            { label: { contains: "CS", mode: "insensitive" } },
            { nameEn: { contains: "CS", mode: "insensitive" } },
            { label: { contains: "Creative Short", mode: "insensitive" } },
            { nameEn: { contains: "Creative Short", mode: "insensitive" } },
            { label: { contains: "Creative Scenario", mode: "insensitive" } },
            { nameEn: { contains: "Creative Scenario", mode: "insensitive" } },
          ],
          isActive: true,
        },
        select: { id: true },
      })
      if (defaultCsQt) {
        resolvedQuestionTypeId = defaultCsQt.id
      }
    }
  }

  return (db as any).cS.create({
    data: {
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      questionA: data.questionA,
      questionB: data.questionB,
      reference: data.reference ?? [],
      difficulty: data.difficulty,
      source: data.source ?? null,
      session: data.session ?? null,
      questionTypeId: resolvedQuestionTypeId || undefined,
      isActive: data.isActive,
      attachments: allAttachments.length > 0
        ? {
            create: allAttachments.map((att, idx) => ({
              type: att.type ?? "image",
              caption: att.caption ?? null,
              content: att.content ?? null,
              url: att.url ?? null,
              table: att.table ?? undefined,
              bottomContent: att.bottomContent ?? null,
              tableBorder: att.tableBorder ?? false,
              position: att.position !== undefined && att.position !== null ? att.position : idx,
            })),
          }
        : undefined,
    },
    include: {
      attachments: {
        orderBy: {
          position: "asc",
        },
      },
    },
  })
}

export async function updateCs(db: PrismaClient, input: UpdateCsInput) {
  const { id, attachments, context, contextCaption, contextBottomContent, ...data } = input

  // Verify existence and load existing attachments
  const existingCs = await getCsById(db, { id })

  // Synchronize context and captions with QuestionAttachment when attachments is not explicitly provided
  if (attachments === undefined && (context !== undefined || contextCaption !== undefined || contextBottomContent !== undefined)) {
    const textAtt = existingCs.attachments?.find(
      (a: any) => (a.type === "PASSAGE" || a.type === "text") && Boolean(a.content?.trim())
    ) || existingCs.attachments?.find(
      (a: any) => a.type === "PASSAGE" || (a.type === "text" && !a.url) || a.url === "text-context"
    )

    const trimmedContext = context !== undefined ? (context?.trim() || null) : (textAtt?.content || null)
    const trimmedCaption = contextCaption !== undefined ? (contextCaption?.trim() || null) : (textAtt?.caption || null)
    const trimmedBottom = contextBottomContent !== undefined ? (contextBottomContent?.trim() || null) : (textAtt?.bottomContent || null)

    if (trimmedContext || trimmedCaption || trimmedBottom) {
      if (textAtt) {
        await (db as any).questionAttachment.update({
          where: { id: textAtt.id },
          data: {
            content: trimmedContext,
            caption: trimmedCaption,
            bottomContent: trimmedBottom,
            type: "PASSAGE",
            url: null,
          },
        })
      } else {
        await (db as any).questionAttachment.create({
          data: {
            csId: id,
            type: "PASSAGE",
            content: trimmedContext,
            caption: trimmedCaption,
            bottomContent: trimmedBottom,
            url: null,
            position: 0,
          },
        })
      }
    } else {
      // Context and captions were cleared by the user
      if (textAtt) {
        await (db as any).questionAttachment.delete({
          where: { id: textAtt.id },
        })
      }
    }
  }

  let resolvedQuestionTypeId = data.questionTypeId
  if (!resolvedQuestionTypeId && data.subjectId) {
    const qt = await db.questionType.findFirst({
      where: {
        OR: [
          { label: { contains: "CS", mode: "insensitive" } },
          { nameEn: { contains: "CS", mode: "insensitive" } },
          { label: { contains: "Creative Short", mode: "insensitive" } },
          { nameEn: { contains: "Creative Short", mode: "insensitive" } },
          { label: { contains: "Creative Scenario", mode: "insensitive" } },
          { nameEn: { contains: "Creative Scenario", mode: "insensitive" } },
        ],
        isActive: true,
        subjects: {
          some: {
            subjectId: data.subjectId,
          },
        },
      },
      select: { id: true },
    })
    if (qt) {
      resolvedQuestionTypeId = qt.id
    }
  }

  const updateData: any = {
    subjectId: data.subjectId,
    chapterId: data.chapterId,
    questionA: data.questionA,
    questionB: data.questionB,
    reference: data.reference,
    difficulty: data.difficulty,
    source: data.source !== undefined ? data.source : undefined,
    session: data.session !== undefined ? data.session : undefined,
    questionTypeId: resolvedQuestionTypeId || undefined,
    isActive: data.isActive,
  }

  if (attachments !== undefined) {
    const allAttachments = Array.isArray(attachments) ? [...attachments] : []
    updateData.attachments = allAttachments.length > 0
      ? {
          deleteMany: {},
          create: allAttachments.map((att, idx) => ({
            type: att.type ?? "image",
            caption: att.caption ?? null,
            content: att.content ?? null,
            url: att.url ?? null,
            table: att.table ?? undefined,
            bottomContent: att.bottomContent ?? null,
            tableBorder: att.tableBorder ?? false,
            position: att.position !== undefined && att.position !== null ? att.position : idx,
          })),
        }
      : { deleteMany: {} }
  }

  return (db as any).cS.update({
    where: { id },
    data: updateData,
    include: {
      attachments: {
        orderBy: {
          position: "asc",
        },
      },
    },
  })
}

export async function deleteCs(db: PrismaClient, input: DeleteCsInput) {
  await getCsById(db, { id: input.id })

  return (db as any).cS.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteCs(db: PrismaClient, input: BulkDeleteCsInput) {
  const res = await (db as any).cS.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function toggleCsActive(db: PrismaClient, input: ToggleCsActiveInput) {
  await getCsById(db, { id: input.id })

  return (db as any).cS.update({
    where: { id: input.id },
    data: { isActive: input.isActive },
  })
}

export async function importCs(db: PrismaClient, input: ImportCsInput) {
  const defaultCsQt = await db.questionType.findFirst({
    where: {
      OR: [
        { label: { contains: "CS", mode: "insensitive" } },
        { nameEn: { contains: "CS", mode: "insensitive" } },
        { label: { contains: "Creative Short", mode: "insensitive" } },
        { nameEn: { contains: "Creative Short", mode: "insensitive" } },
        { label: { contains: "Creative Scenario", mode: "insensitive" } },
        { nameEn: { contains: "Creative Scenario", mode: "insensitive" } },
      ],
      isActive: true,
    },
    select: { id: true },
  })

  const subjectQtCache: Record<string, string> = {}

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const cs of input.cses) {
        const { ...data } = cs

        let resolvedQuestionTypeId = data.questionTypeId
        if (!resolvedQuestionTypeId) {
          const subId = data.subjectId
          if (subjectQtCache[subId]) {
            resolvedQuestionTypeId = subjectQtCache[subId]
          } else {
            const qt = await tx.questionType.findFirst({
              where: {
                OR: [
                  { label: { contains: "CS", mode: "insensitive" } },
                  { nameEn: { contains: "CS", mode: "insensitive" } },
                  { label: { contains: "Creative Short", mode: "insensitive" } },
                  { nameEn: { contains: "Creative Short", mode: "insensitive" } },
                  { label: { contains: "Creative Scenario", mode: "insensitive" } },
                  { nameEn: { contains: "Creative Scenario", mode: "insensitive" } },
                ],
                isActive: true,
                subjects: {
                  some: {
                    subjectId: subId,
                  },
                },
              },
              select: { id: true },
            })
            if (qt) {
              resolvedQuestionTypeId = qt.id
              subjectQtCache[subId] = qt.id
            } else if (defaultCsQt) {
              resolvedQuestionTypeId = defaultCsQt.id
            }
          }
        }

        const createdCs = await (tx as any).cS.create({
          data: {
            subjectId: data.subjectId,
            chapterId: data.chapterId,
            questionA: data.questionA,
            questionB: data.questionB,
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            source: data.source ?? null,
            session: data.session ?? null,
            questionTypeId: resolvedQuestionTypeId || undefined,
            isActive: data.isActive ?? true,
          },
        })
        results.push(createdCs)
      }
      return results
    },
    {
      timeout: 30000,
    }
  )

  return { importedCount: created.length }
}

export async function getCsStats(db: PrismaClient, input: CsStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId

  const [totalCount, activeCount, inactiveCount, easyCount, mediumCount, hardCount] = await Promise.all([
    (db as any).cS.count({ where }),
    (db as any).cS.count({ where: { ...where, isActive: true } }),
    (db as any).cS.count({ where: { ...where, isActive: false } }),
    (db as any).cS.count({ where: { ...where, difficulty: "EASY" } }),
    (db as any).cS.count({ where: { ...where, difficulty: "MEDIUM" } }),
    (db as any).cS.count({ where: { ...where, difficulty: "HARD" } }),
  ])

  return {
    totalCount,
    activeCount,
    inactiveCount,
    difficultyCounts: {
      EASY: easyCount,
      MEDIUM: mediumCount,
      HARD: hardCount,
    },
  }
}

export async function getBoardYears(
  db: PrismaClient,
  input: { subjectId?: string; chapterId?: string } = {}
) {
  const where: any = {
    OR: [
      { NOT: { reference: { equals: [] } } },
      { AND: [{ source: { not: null } }, { session: { not: null } }] },
    ],
  }
  if (input.subjectId && input.subjectId !== "All") where.subjectId = input.subjectId
  if (input.chapterId && input.chapterId !== "All") where.chapterId = input.chapterId

  const questions = await (db as any).cS.findMany({
    where,
    select: { reference: true, source: true, session: true },
  })

  const countMap = new Map<string, number>()
  for (const q of questions) {
    if (q.source && q.session) {
      const key = `${q.source}-${q.session}`
      if (!isIgnoredReference(key)) {
        countMap.set(key, (countMap.get(key) || 0) + 1)
      }
    }
    for (const ref of q.reference || []) {
      if (!ref || isIgnoredReference(ref)) continue
      if (q.source && q.session && ref === `${q.source}-${q.session}`) continue
      countMap.set(ref, (countMap.get(ref) || 0) + 1)
    }
  }

  const categoryOrder: Record<string, number> = {
    BOARD: 1,
    CADET: 2,
    SCHOOL: 3,
    TEST_EXAM: 4,
    TEXTBOOK: 5,
    OTHER: 6,
  }

  return Array.from(countMap.entries())
    .map(([rawRef, count]) => {
      const parts = rawRef.split("-")
      const yearStr = parts[parts.length - 1]
      const year = !isNaN(Number(yearStr)) ? Number(yearStr) : 0
      const boardName = parts.length > 1 ? parts.slice(0, parts.length - 1).join("-") : rawRef
      const category = categorizeReference(rawRef)
      return {
        rawRef,
        boardName,
        year,
        category,
        count,
      }
    })
    .sort((a, b) => {
      const diff = (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99)
      if (diff !== 0) return diff
      return b.count - a.count
    })
}

export async function resolveCsReport(
  db: PrismaClient,
  input: ResolveCsReportInput,
  userId?: string | null
) {
  const { csId, reportId, resolvedNote } = input

  const cs = await (db as any).cS.findUnique({
    where: { id: csId },
    select: { id: true },
  })

  if (!cs) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `CS with ID ${csId} not found`,
    })
  }

  const whereClause: any = {
    entityType: "CS",
    entityId: csId,
  }

  if (reportId) {
    whereClause.id = reportId
  }

  const existingReports = await (db as any).questionReport.findMany({
    where: whereClause,
  })

  if (existingReports.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No report found for this CS question",
    })
  }

  const result = await (db as any).questionReport.updateMany({
    where: whereClause,
    data: {
      status: "RESOLVED",
      resolvedNote: resolvedNote?.trim() || "Resolved by admin",
      resolvedById: userId ?? null,
      resolvedAt: new Date(),
    },
  })

  return {
    success: true,
    resolvedCount: result.count,
  }
}

export async function assignCsReport(
  db: PrismaClient,
  input: AssignCsReportInput,
  currentUserId?: string | null
) {
  const { csId, reportId, assignedToId, note } = input

  const cs = await (db as any).cS.findUnique({
    where: { id: csId },
    select: { id: true },
  })

  if (!cs) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `CS with ID ${csId} not found`,
    })
  }

  const assignee = await db.user.findUnique({
    where: { id: assignedToId },
    select: { id: true, name: true, email: true },
  })

  if (!assignee) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Assignee user with ID ${assignedToId} not found`,
    })
  }

  const whereClause: any = {
    entityType: "CS",
    entityId: csId,
  }

  if (reportId) {
    whereClause.id = reportId
  }

  const existingReports = await (db as any).questionReport.findMany({
    where: whereClause,
  })

  if (existingReports.length === 0) {
    const newReport = await (db as any).questionReport.create({
      data: {
        entityType: "CS",
        entityId: csId,
        reportType: "OTHER",
        description: note?.trim() || "প্রশ্ন পর্যালোচনা ও যাচাইয়ের জন্য দায়িত্ব অর্পণ করা হয়েছে",
        status: "ASSIGNED",
        reportedById: currentUserId ?? null,
        resolvedById: assignedToId,
        resolvedNote: note?.trim() || null,
        resolvedAt: null,
      },
    })

    return {
      success: true,
      assignedCount: 1,
      assignee,
      createdReportId: newReport.id,
    }
  }

  const result = await (db as any).questionReport.updateMany({
    where: whereClause,
    data: {
      status: "ASSIGNED",
      resolvedById: assignedToId,
      resolvedNote: note?.trim() || null,
      resolvedAt: null,
    },
  })

  return {
    success: true,
    assignedCount: result.count,
    assignee,
  }
}

