import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import { categorizeReference, isIgnoredReference } from "@workspace/utils"
import type {
  CreateApplicationInput,
  DeleteApplicationInput,
  GetApplicationInput,
  ListApplicationsInput,
  UpdateApplicationInput,
  BulkDeleteApplicationsInput,
  ImportApplicationsInput,
  ApplicationStatsInput,
  ApplicationBoardYearsInput,
  ToggleApplicationActiveInput,
  ResolveApplicationReportInput,
  AssignApplicationReportInput,
} from "./application.schema"

// Helper function to resolve 'Application' question type ID
async function resolveApplicationQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Application", mode: "insensitive" } },
        { label: { equals: "Application", mode: "insensitive" } },
        { nameEn: { equals: "Formal Letter", mode: "insensitive" } },
        { label: { equals: "Formal Letter", mode: "insensitive" } },
        { nameBn: { equals: "আবেদনপত্র", mode: "insensitive" } },
        { label: { equals: "আবেদনপত্র", mode: "insensitive" } },
        { nameBn: { equals: "দরখাস্ত", mode: "insensitive" } },
        { label: { equals: "দরখাস্ত", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Application",
        nameBn: "আবেদনপত্র",
        label: "Application",
        mark: 10,
        position: 10,
        descriptionEn: "Formal Application / Official Request Writing",
        descriptionBn: "আবেদনপত্র / দরখাস্ত লিখন",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listApplications(db: PrismaClient, input: ListApplicationsInput) {
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
      where: { entityType: "APPLICATION", status: { in: ["PENDING", "ASSIGNED"] } },
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
      const applicationsWithRef = await db.application.findMany({
        where: {
          NOT: { reference: { equals: [] } },
          ...(where.subjectId ? { subjectId: where.subjectId } : {}),
          ...(where.subject ? { subject: where.subject } : {}),
        },
        select: { reference: true },
      })
      const schoolRefs = new Set<string>()
      for (const app of applicationsWithRef) {
        for (const ref of app.reference || []) {
          if (!ref || isIgnoredReference(ref)) continue
          if (categorizeReference(ref) === "SCHOOL") {
            schoolRefs.add(ref)
          }
        }
      }
      if (schoolRefs.size > 0) {
        where.reference = { hasSome: Array.from(schoolRefs) }
      } else {
        where.id = "__NO_MATCHING_SCHOOL_APPLICATION__"
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
    db.application.findMany({
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
    db.application.count({ where }),
  ])

  const itemIds = items.map((it) => it.id)
  const itemReports =
    itemIds.length > 0
      ? await db.questionReport.findMany({
          where: { entityType: "APPLICATION", entityId: { in: itemIds } },
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

export async function getApplicationById(db: PrismaClient, input: GetApplicationInput) {
  const application = await db.application.findUnique({
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

  if (!application) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Application with ID ${input.id} not found`,
    })
  }

  return application
}

export async function createApplication(db: PrismaClient, input: CreateApplicationInput) {
  const data = input
  const resolvedQuestionTypeId =
    data.questionTypeId || (await resolveApplicationQuestionTypeId(db))

  return db.application.create({
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

export async function updateApplication(db: PrismaClient, input: UpdateApplicationInput) {
  const { id, ...data } = input

  // Verify existence
  await getApplicationById(db, { id })
  const resolvedQuestionTypeId =
    data.questionTypeId !== undefined
      ? data.questionTypeId || (await resolveApplicationQuestionTypeId(db))
      : undefined

  return db.application.update({
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

export async function deleteApplication(db: PrismaClient, input: DeleteApplicationInput) {
  await getApplicationById(db, { id: input.id })

  return db.application.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteApplications(
  db: PrismaClient,
  input: BulkDeleteApplicationsInput
) {
  const res = await db.application.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importApplications(db: PrismaClient, input: ImportApplicationsInput) {
  const fallbackQuestionTypeId = await resolveApplicationQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const a of input.applications) {
        const data = a

        const createdApp = await tx.application.create({
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
        results.push(createdApp)
      }
      return results
    },
    {
      timeout: 30000,
    }
  )

  return { importedCount: created.length }
}

export async function getApplicationStats(
  db: PrismaClient,
  input: ApplicationStatsInput = {}
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
      db.application.count({ where }),
      db.application.count({ where: { ...where, isActive: true } }),
      db.application.count({ where: { ...where, isActive: false } }),
      db.application.count({ where: { ...where, difficulty: "EASY" } }),
      db.application.count({ where: { ...where, difficulty: "MEDIUM" } }),
      db.application.count({ where: { ...where, difficulty: "HARD" } }),
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
  input: ApplicationBoardYearsInput = {}
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

  const questions = await db.application.findMany({
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

export async function toggleApplicationActive(
  db: PrismaClient,
  input: ToggleApplicationActiveInput
) {
  const { id, isActive } = input
  return db.application.update({
    where: { id },
    data: { isActive },
  })
}

export async function resolveApplicationReport(
  db: PrismaClient,
  input: ResolveApplicationReportInput,
  userId?: string | null
) {
  const { applicationId, reportId, resolvedNote } = input

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { id: true },
  })

  if (!application) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Application with ID ${applicationId} not found`,
    })
  }

  const whereClause: any = {
    entityType: "APPLICATION",
    entityId: applicationId,
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
      message: "No report found for this application",
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

export async function assignApplicationReport(
  db: PrismaClient,
  input: AssignApplicationReportInput,
  currentUserId?: string | null
) {
  const { applicationId, reportId, assignedToId, note } = input

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { id: true },
  })

  if (!application) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Application with ID ${applicationId} not found`,
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
    entityType: "APPLICATION",
    entityId: applicationId,
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
        entityType: "APPLICATION",
        entityId: applicationId,
        reportType: "OTHER",
        description:
          note?.trim() || "আবেদনপত্র পর্যালোচনা ও যাচাইয়ের জন্য দায়িত্ব অর্পণ করা হয়েছে",
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
