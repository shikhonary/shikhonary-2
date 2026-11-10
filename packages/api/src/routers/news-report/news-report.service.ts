import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import { categorizeReference, isIgnoredReference } from "@workspace/utils"
import type {
  CreateNewsReportInput,
  DeleteNewsReportInput,
  GetNewsReportInput,
  ListNewsReportsInput,
  UpdateNewsReportInput,
  BulkDeleteNewsReportsInput,
  ImportNewsReportsInput,
  NewsReportStatsInput,
  NewsReportBoardYearsInput,
  ToggleNewsReportActiveInput,
  ResolveNewsReportReportInput,
  AssignNewsReportReportInput,
} from "./news-report.schema"

// Helper function to resolve 'News Report' question type ID
async function resolveNewsReportQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "News Report", mode: "insensitive" } },
        { label: { equals: "News Report", mode: "insensitive" } },
        { nameEn: { equals: "News-Report", mode: "insensitive" } },
        { label: { equals: "News-Report", mode: "insensitive" } },
        { nameEn: { equals: "Report", mode: "insensitive" } },
        { label: { equals: "Report", mode: "insensitive" } },
        { nameEn: { equals: "Report Writing", mode: "insensitive" } },
        { label: { equals: "Report Writing", mode: "insensitive" } },
        { nameBn: { equals: "সংবাদ প্রতিবেদন", mode: "insensitive" } },
        { label: { equals: "সংবাদ প্রতিবেদন", mode: "insensitive" } },
        { nameBn: { equals: "প্রতিবেদন", mode: "insensitive" } },
        { label: { equals: "প্রতিবেদন", mode: "insensitive" } },
        { nameBn: { equals: "সংবাদ প্রতিবেদন লিখন", mode: "insensitive" } },
        { label: { equals: "সংবাদ প্রতিবেদন লিখন", mode: "insensitive" } },
        { nameBn: { equals: "প্রতিবেদন লিখন", mode: "insensitive" } },
        { label: { equals: "প্রতিবেদন লিখন", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "News Report",
        nameBn: "সংবাদ প্রতিবেদন",
        label: "News Report",
        mark: 10,
        position: 14,
        descriptionEn: "News Report / Journalistic Report Writing",
        descriptionBn: "সংবাদ প্রতিবেদন ও প্রাতিষ্ঠানিক প্রতিবেদন লিখন",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listNewsReports(db: PrismaClient, input: ListNewsReportsInput) {
  const {
    page,
    limit,
    query,
    subjectId,
    academicClassId,
    difficulty,
    sort,
    board,
    reference,
    isActive,
    hasReport,
  } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}

  if (subjectId && subjectId !== "All") where.subjectId = subjectId
  if (difficulty && difficulty !== "All") where.difficulty = difficulty

  if (academicClassId && academicClassId !== "All") {
    where.subject = {
      classSubjects: {
        some: {
          classId: academicClassId,
        },
      },
    }
  }

  if (isActive !== undefined && isActive !== "All") {
    if (typeof isActive === "boolean") {
      where.isActive = isActive
    } else if (isActive === "true" || isActive === "ACTIVE") {
      where.isActive = true
    } else if (isActive === "false" || isActive === "INACTIVE") {
      where.isActive = false
    }
  }

  if (hasReport !== undefined && hasReport !== "All") {
    const isReported = hasReport === true || hasReport === "YES" || hasReport === "true"
    const reports = await db.questionReport.findMany({
      where: { entityType: "NEWS_REPORT", status: { in: ["PENDING", "ASSIGNED"] } },
      select: { entityId: true },
      distinct: ["entityId"],
    })
    const reportedIds = reports.map((r) => r.entityId)
    if (isReported) {
      where.id = { in: reportedIds }
    } else {
      where.id = { notIn: reportedIds }
    }
  }

  const selectedBoard = board || reference
  if (selectedBoard && selectedBoard !== "All") {
    if (selectedBoard === "SCHOOL_ALL") {
      const itemsWithRef = await db.newsReport.findMany({
        where: {
          NOT: { reference: { equals: [] } },
          ...(where.subjectId ? { subjectId: where.subjectId } : {}),
          ...(where.subject ? { subject: where.subject } : {}),
        },
        select: { reference: true },
      })
      const schoolRefs = new Set<string>()
      for (const item of itemsWithRef) {
        for (const ref of item.reference || []) {
          if (!ref || isIgnoredReference(ref)) continue
          if (categorizeReference(ref) === "SCHOOL") {
            schoolRefs.add(ref)
          }
        }
      }
      if (schoolRefs.size > 0) {
        where.reference = { hasSome: Array.from(schoolRefs) }
      } else {
        where.id = "__NO_MATCHING_SCHOOL_NEWS_REPORT__"
      }
    } else {
      where.reference = { has: selectedBoard }
    }
  }

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "newest" || sort === "createdAt_desc") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "oldest" || sort === "createdAt_asc") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "title_asc" || sort === "name_asc") {
    orderBy = { title: "asc" }
  } else if (sort === "title_desc" || sort === "name_desc") {
    orderBy = { title: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.newsReport.findMany({
      where,
      skip,
      take: resolvedLimit,
      orderBy,
      include: {
        subject: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
            code: true,
            group: true,
            classSubjects: {
              include: {
                academicClass: true,
              },
            },
          },
        },
        questionType: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
            label: true,
            mark: true,
          },
        },
      },
    }),
    db.newsReport.count({ where }),
  ])

  const itemIds = items.map((it) => it.id)
  const itemReports =
    itemIds.length > 0
      ? await db.questionReport.findMany({
          where: { entityType: "NEWS_REPORT", entityId: { in: itemIds } },
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

  const enhancedItems = items.map((item) => {
    const repList = reportMap.get(item.id) || []
    const hasActiveReport = repList.some(
      (r) => r.status === "PENDING" || r.status === "ASSIGNED"
    )
    return {
      ...item,
      hasReport: hasActiveReport,
      reports: repList,
    }
  })

  return {
    items: enhancedItems,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getNewsReportById(db: PrismaClient, input: GetNewsReportInput) {
  const newsReport = await db.newsReport.findUnique({
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
      questionType: true,
    },
  })

  if (!newsReport) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `News Report with ID ${input.id} not found`,
    })
  }

  return newsReport
}

export async function createNewsReport(db: PrismaClient, input: CreateNewsReportInput) {
  const data = input
  const resolvedQuestionTypeId =
    data.questionTypeId || (await resolveNewsReportQuestionTypeId(db))

  return db.newsReport.create({
    data: {
      title: data.title,
      reference: data.reference ?? [],
      source: data.source,
      session: data.session,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      subjectId: data.subjectId,
      questionTypeId: resolvedQuestionTypeId,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
    include: {
      subject: true,
      questionType: true,
    },
  })
}

export async function updateNewsReport(db: PrismaClient, input: UpdateNewsReportInput) {
  const { id, ...data } = input

  // Verify existence
  await getNewsReportById(db, { id })
  const resolvedQuestionTypeId =
    data.questionTypeId !== undefined
      ? data.questionTypeId || (await resolveNewsReportQuestionTypeId(db))
      : undefined

  return db.newsReport.update({
    where: { id },
    data: {
      title: data.title,
      reference: data.reference,
      source: data.source,
      session: data.session,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount,
      subjectId: data.subjectId,
      ...(resolvedQuestionTypeId ? { questionTypeId: resolvedQuestionTypeId } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
    include: {
      subject: true,
      questionType: true,
    },
  })
}

export async function deleteNewsReport(db: PrismaClient, input: DeleteNewsReportInput) {
  await getNewsReportById(db, { id: input.id })

  return db.newsReport.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteNewsReports(
  db: PrismaClient,
  input: BulkDeleteNewsReportsInput
) {
  const res = await db.newsReport.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importNewsReports(db: PrismaClient, input: ImportNewsReportsInput) {
  const fallbackQuestionTypeId = await resolveNewsReportQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const n of input.newsReports) {
        const data = n

        const createdItem = await tx.newsReport.create({
          data: {
            title: data.title,
            reference: data.reference || [],
            source: data.source || input.source,
            session: data.session || input.session,
            difficulty: data.difficulty ?? input.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            questionTypeId: data.questionTypeId || fallbackQuestionTypeId,
            isActive: data.isActive !== undefined ? data.isActive : true,
          },
        })
        results.push(createdItem)
      }
      return results
    },
    {
      timeout: 30000,
    }
  )

  return { importedCount: created.length }
}

export async function getNewsReportStats(
  db: PrismaClient,
  input: NewsReportStatsInput = {}
) {
  const where: any = {}
  if (input.subjectId && input.subjectId !== "All") where.subjectId = input.subjectId
  if (input.academicClassId && input.academicClassId !== "All") {
    where.subject = {
      classSubjects: {
        some: {
          classId: input.academicClassId,
        },
      },
    }
  }

  const [totalCount, activeCount, inactiveCount, easyCount, mediumCount, hardCount] =
    await Promise.all([
      db.newsReport.count({ where }),
      db.newsReport.count({ where: { ...where, isActive: true } }),
      db.newsReport.count({ where: { ...where, isActive: false } }),
      db.newsReport.count({ where: { ...where, difficulty: "EASY" } }),
      db.newsReport.count({ where: { ...where, difficulty: "MEDIUM" } }),
      db.newsReport.count({ where: { ...where, difficulty: "HARD" } }),
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
  input: NewsReportBoardYearsInput = {}
) {
  const where: any = {
    NOT: { reference: { equals: [] } },
  }
  if (input.subjectId && input.subjectId !== "All") where.subjectId = input.subjectId
  if (input.academicClassId && input.academicClassId !== "All") {
    where.subject = {
      classSubjects: {
        some: {
          classId: input.academicClassId,
        },
      },
    }
  }

  const questions = await db.newsReport.findMany({
    where,
    select: { reference: true },
  })

  const countMap = new Map<string, number>()
  for (const q of questions) {
    for (const ref of q.reference || []) {
      if (!ref || isIgnoredReference(ref)) continue
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

export async function toggleNewsReportActive(
  db: PrismaClient,
  input: ToggleNewsReportActiveInput
) {
  const { id, isActive } = input
  return db.newsReport.update({
    where: { id },
    data: { isActive },
  })
}

export async function resolveNewsReportReport(
  db: PrismaClient,
  input: ResolveNewsReportReportInput,
  userId?: string | null
) {
  const { newsReportId, reportId, resolvedNote } = input

  const newsReport = await db.newsReport.findUnique({
    where: { id: newsReportId },
    select: { id: true },
  })

  if (!newsReport) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `News Report with ID ${newsReportId} not found`,
    })
  }

  const whereClause: any = {
    entityType: "NEWS_REPORT",
    entityId: newsReportId,
  }

  if (reportId) {
    whereClause.id = reportId
  }

  const existingReports = await db.questionReport.findMany({
    where: whereClause,
  })

  if (existingReports.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No report found for this news report",
    })
  }

  const result = await db.questionReport.updateMany({
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

export async function assignNewsReportReport(
  db: PrismaClient,
  input: AssignNewsReportReportInput,
  currentUserId?: string | null
) {
  const { newsReportId, reportId, assignedToId, note } = input

  const newsReport = await db.newsReport.findUnique({
    where: { id: newsReportId },
    select: { id: true },
  })

  if (!newsReport) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `News Report with ID ${newsReportId} not found`,
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
    entityType: "NEWS_REPORT",
    entityId: newsReportId,
  }

  if (reportId) {
    whereClause.id = reportId
  }

  const existingReports = await db.questionReport.findMany({
    where: whereClause,
  })

  if (existingReports.length === 0) {
    const newReport = await db.questionReport.create({
      data: {
        entityType: "NEWS_REPORT",
        entityId: newsReportId,
        reportType: "OTHER",
        description:
          note?.trim() || "সংবাদ প্রতিবেদন পর্যালোচনা ও যাচাইয়ের জন্য দায়িত্ব অর্পণ করা হয়েছে",
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

  const result = await db.questionReport.updateMany({
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
