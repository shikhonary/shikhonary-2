import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateNewsReportInput,
  DeleteNewsReportInput,
  GetNewsReportInput,
  ListNewsReportsInput,
  UpdateNewsReportInput,
  BulkDeleteNewsReportsInput,
  ImportNewsReportsInput,
  NewsReportStatsInput,
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
  const { page, limit, query, subjectId, difficulty, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}

  if (subjectId) where.subjectId = subjectId
  if (difficulty) where.difficulty = difficulty

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

  return {
    items,
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
          classSubjects: true,
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
  const resolvedQuestionTypeId = await resolveNewsReportQuestionTypeId(db)

  return db.newsReport.create({
    data: {
      title: data.title,
      reference: data.reference ?? [],
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      subjectId: data.subjectId,
      questionTypeId: resolvedQuestionTypeId,
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
  const resolvedQuestionTypeId = await resolveNewsReportQuestionTypeId(db)

  return db.newsReport.update({
    where: { id },
    data: {
      title: data.title,
      reference: data.reference,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount,
      subjectId: data.subjectId,
      questionTypeId: resolvedQuestionTypeId,
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

export async function bulkDeleteNewsReports(db: PrismaClient, input: BulkDeleteNewsReportsInput) {
  const res = await db.newsReport.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importNewsReports(db: PrismaClient, input: ImportNewsReportsInput) {
  const resolvedQuestionTypeId = await resolveNewsReportQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const t of input.newsReports) {
        const data = t

        const createdItem = await tx.newsReport.create({
          data: {
            title: data.title,
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            questionTypeId: resolvedQuestionTypeId,
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

export async function getNewsReportStats(db: PrismaClient, input: NewsReportStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.newsReport.count({ where }),
    db.newsReport.count({ where: { ...where, difficulty: "EASY" } }),
    db.newsReport.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.newsReport.count({ where: { ...where, difficulty: "HARD" } }),
  ])

  return {
    totalCount,
    difficultyCounts: {
      EASY: easyCount,
      MEDIUM: mediumCount,
      HARD: hardCount,
    },
  }
}
