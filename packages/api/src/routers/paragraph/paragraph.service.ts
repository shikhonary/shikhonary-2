import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import { categorizeReference, isIgnoredReference } from "@workspace/utils"
import type {
  CreateParagraphInput,
  DeleteParagraphInput,
  GetParagraphInput,
  ListParagraphsInput,
  UpdateParagraphInput,
  BulkDeleteParagraphsInput,
  ImportParagraphsInput,
  ParagraphStatsInput,
  ParagraphBoardYearsInput,
  ToggleParagraphActiveInput,
  ResolveParagraphReportInput,
  AssignParagraphReportInput,
} from "./paragraph.schema"

// Helper function to resolve 'Paragraph' question type ID
async function resolveParagraphQuestionTypeId(db: any) {
  const qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Paragraph", mode: "insensitive" } },
        { label: { equals: "Paragraph", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Required 'Paragraph' Question Type template was not found. Please create it under Question Types first.",
    })
  }

  return qt.id as string
}

export async function listParagraphs(db: PrismaClient, input: ListParagraphsInput) {
  const {
    page,
    limit,
    query,
    academicClassId,
    subjectId,
    chapterId,
    board,
    reference,
    isActive,
    hasReport,
    difficulty,
    source,
    session,
    sort,
  } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}

  if (academicClassId && !subjectId) {
    where.subject = {
      classSubjects: {
        some: {
          classId: academicClassId,
        },
      },
    }
  }

  if (subjectId && subjectId !== "All") where.subjectId = subjectId
  if (chapterId && chapterId !== "All") where.academicChapterId = chapterId
  if (difficulty && difficulty !== "All") where.difficulty = difficulty
  if (source && source !== "All") where.source = source
  if (session && session !== "All") where.session = session

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
      where: { entityType: "PARAGRAPH", status: { in: ["PENDING", "ASSIGNED"] } },
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

  const boardFilter = board || reference
  if (boardFilter && boardFilter !== "All") {
    if (boardFilter === "SCHOOL_ALL") {
      const itemsWithRef = await db.paragraph.findMany({
        where: {
          NOT: { reference: { equals: [] } },
          ...(where.subjectId ? { subjectId: where.subjectId } : {}),
          ...(where.academicChapterId ? { academicChapterId: where.academicChapterId } : {}),
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
        where.id = "__NO_MATCHING_SCHOOL_PARAGRAPH__"
      }
    } else {
      where.reference = { has: boardFilter }
    }
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "newest" || sort === "createdAt_desc") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "oldest" || sort === "createdAt_asc") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "name_asc") {
    orderBy = { name: "asc" }
  } else if (sort === "name_desc") {
    orderBy = { name: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.paragraph.findMany({
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
            classSubjects: {
              select: {
                academicClass: {
                  select: {
                    id: true,
                    nameEn: true,
                    nameBn: true,
                  },
                },
              },
            },
          },
        },
        academicChapter: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
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
    db.paragraph.count({ where }),
  ])

  const itemIds = items.map((it) => it.id)
  const itemReports =
    itemIds.length > 0
      ? await db.questionReport.findMany({
          where: { entityType: "PARAGRAPH", entityId: { in: itemIds } },
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

  const enhancedItems = items.map((p) => {
    const repList = reportMap.get(p.id) || []
    const hasPendingReport = repList.some((r) => r.status === "PENDING" || r.status === "ASSIGNED")
    return {
      ...p,
      chapter: p.academicChapter,
      chapterId: p.academicChapterId,
      hasReport: hasPendingReport,
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

export async function getParagraphById(db: PrismaClient, input: GetParagraphInput) {
  const paragraph = await db.paragraph.findUnique({
    where: { id: input.id },
    include: {
      subject: {
        include: {
          classSubjects: true,
        },
      },
      academicChapter: true,
      questionType: true,
    },
  })

  if (!paragraph) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Paragraph with ID ${input.id} not found`,
    })
  }

  return {
    ...paragraph,
    chapter: paragraph.academicChapter,
    chapterId: paragraph.academicChapterId,
  }
}

export async function createParagraph(db: PrismaClient, input: CreateParagraphInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveParagraphQuestionTypeId(db)

  const created = await db.paragraph.create({
    data: {
      name: data.name,
      reference: data.reference ?? [],
      source: data.source ?? null,
      session: data.session ?? null,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      subjectId: data.subjectId,
      academicChapterId: data.chapterId || null,
      questionTypeId: resolvedQuestionTypeId,
      isActive: data.isActive ?? true,
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })

  return {
    ...created,
    chapter: created.academicChapter,
    chapterId: created.academicChapterId,
  }
}

export async function updateParagraph(db: PrismaClient, input: UpdateParagraphInput) {
  const { id, ...data } = input

  // Verify existence
  await getParagraphById(db, { id })
  const resolvedQuestionTypeId = await resolveParagraphQuestionTypeId(db)

  const updated = await db.paragraph.update({
    where: { id },
    data: {
      name: data.name,
      reference: data.reference,
      source: data.source !== undefined ? data.source : undefined,
      session: data.session !== undefined ? data.session : undefined,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount,
      subjectId: data.subjectId,
      academicChapterId: data.chapterId !== undefined ? data.chapterId : undefined,
      questionTypeId: resolvedQuestionTypeId,
      isActive: data.isActive !== undefined ? data.isActive : undefined,
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })

  return {
    ...updated,
    chapter: updated.academicChapter,
    chapterId: updated.academicChapterId,
  }
}

export async function deleteParagraph(db: PrismaClient, input: DeleteParagraphInput) {
  await getParagraphById(db, { id: input.id })

  return db.paragraph.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteParagraphs(db: PrismaClient, input: BulkDeleteParagraphsInput) {
  const res = await db.paragraph.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importParagraphs(db: PrismaClient, input: ImportParagraphsInput) {
  const resolvedQuestionTypeId = await resolveParagraphQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const p of input.paragraphs) {
        const data = p

        const createdParagraph = await tx.paragraph.create({
          data: {
            name: data.name,
            reference: data.reference || [],
            source: data.source ?? null,
            session: data.session ?? null,
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            academicChapterId: data.chapterId || null,
            questionTypeId: resolvedQuestionTypeId,
            isActive: data.isActive ?? true,
          },
        })
        results.push(createdParagraph)
      }
      return results
    },
    {
      timeout: 30000,
    }
  )

  return { importedCount: created.length }
}

export async function getParagraphStats(db: PrismaClient, input: ParagraphStatsInput = {}) {
  const where: any = {}
  if (input.academicClassId && !input.subjectId) {
    where.subject = {
      classSubjects: {
        some: {
          classId: input.academicClassId,
        },
      },
    }
  }
  if (input.subjectId && input.subjectId !== "All") where.subjectId = input.subjectId
  if (input.chapterId && input.chapterId !== "All") where.academicChapterId = input.chapterId

  const [totalCount, activeCount, inactiveCount, referenceCount] = await Promise.all([
    db.paragraph.count({ where }),
    db.paragraph.count({ where: { ...where, isActive: true } }),
    db.paragraph.count({ where: { ...where, isActive: false } }),
    db.paragraph.count({ where: { ...where, NOT: { reference: { equals: [] } } } }),
  ])

  return {
    totalCount,
    activeCount,
    inactiveCount,
    referenceCount,
  }
}

export async function getBoardYears(
  db: PrismaClient,
  input: ParagraphBoardYearsInput = {}
) {
  const where: any = {
    NOT: { reference: { equals: [] } },
  }
  if (input.subjectId && input.subjectId !== "All") where.subjectId = input.subjectId
  if (input.chapterId && input.chapterId !== "All") where.academicChapterId = input.chapterId
  if (input.academicClassId && input.academicClassId !== "All" && (!input.subjectId || input.subjectId === "All")) {
    where.subject = {
      classSubjects: {
        some: {
          classId: input.academicClassId,
        },
      },
    }
  }

  const paragraphs = await db.paragraph.findMany({
    where,
    select: { reference: true },
  })

  const countMap = new Map<string, number>()
  for (const p of paragraphs) {
    for (const ref of p.reference || []) {
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

export async function toggleParagraphActive(
  db: PrismaClient,
  input: ToggleParagraphActiveInput
) {
  const { id, isActive } = input
  return db.paragraph.update({
    where: { id },
    data: { isActive },
  })
}

export async function resolveParagraphReport(
  db: PrismaClient,
  input: ResolveParagraphReportInput,
  userId?: string | null
) {
  const { paragraphId, reportId, resolvedNote } = input

  const paragraph = await db.paragraph.findUnique({
    where: { id: paragraphId },
    select: { id: true },
  })

  if (!paragraph) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Paragraph with ID ${paragraphId} not found`,
    })
  }

  const whereClause: any = {
    entityType: "PARAGRAPH",
    entityId: paragraphId,
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
      message: "No report found for this paragraph",
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

export async function assignParagraphReport(
  db: PrismaClient,
  input: AssignParagraphReportInput,
  reporterId?: string | null
) {
  const { paragraphId, reportId, assignedToId, note } = input

  const paragraph = await db.paragraph.findUnique({
    where: { id: paragraphId },
    select: { id: true },
  })

  if (!paragraph) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Paragraph with ID ${paragraphId} not found`,
    })
  }

  const assignedUser = await db.user.findUnique({
    where: { id: assignedToId },
    select: { id: true, name: true, email: true },
  })

  if (!assignedUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "অ্যাসাইন করার জন্য ইউজারকে খুঁজে পাওয়া যায়নি।",
    })
  }

  const whereClause: any = {
    entityType: "PARAGRAPH",
    entityId: paragraphId,
  }

  if (reportId) {
    whereClause.id = reportId
  }

  const existingReports = await db.questionReport.findMany({
    where: whereClause,
  })

  if (existingReports.length === 0) {
    await db.questionReport.create({
      data: {
        entityType: "PARAGRAPH",
        entityId: paragraphId,
        reportType: "OTHER",
        description: note?.trim() || "প্রশ্ন পর্যালোচনা ও যাচাইয়ের জন্য দায়িত্ব অর্পণ করা হয়েছে",
        status: "ASSIGNED",
        reportedById: reporterId ?? null,
        resolvedById: assignedToId,
        resolvedNote: note?.trim() || null,
        resolvedAt: null,
      },
    })

    return {
      success: true,
      assignedCount: 1,
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
  }
}
