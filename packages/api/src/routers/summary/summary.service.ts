import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateSummaryInput,
  DeleteSummaryInput,
  GetSummaryInput,
  ListSummariesInput,
  UpdateSummaryInput,
  BulkDeleteSummariesInput,
  ImportSummariesInput,
  SummaryStatsInput,
} from "./summary.schema"

// Helper function to resolve 'Summary' question type ID
async function resolveSummaryQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Summary", mode: "insensitive" } },
        { label: { equals: "Summary", mode: "insensitive" } },
        { nameEn: { equals: "Summary Writing", mode: "insensitive" } },
        { label: { equals: "Summary Writing", mode: "insensitive" } },
        { nameEn: { equals: "Précis", mode: "insensitive" } },
        { label: { equals: "Précis", mode: "insensitive" } },
        { nameBn: { equals: "সারাংশ", mode: "insensitive" } },
        { label: { equals: "সারাংশ", mode: "insensitive" } },
        { nameBn: { equals: "সারমর্ম", mode: "insensitive" } },
        { label: { equals: "সারমর্ম", mode: "insensitive" } },
        { nameBn: { equals: "সারসংক্ষেপ", mode: "insensitive" } },
        { label: { equals: "সারসংক্ষেপ", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Summary",
        nameBn: "সারাংশ / সারমর্ম",
        label: "Summary",
        mark: 10,
        position: 11,
        descriptionEn: "Summary / Précis Writing",
        descriptionBn: "সারাংশ ও সারমর্ম লিখন",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listSummaries(db: PrismaClient, input: ListSummariesInput) {
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
    db.summary.findMany({
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
    db.summary.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getSummaryById(db: PrismaClient, input: GetSummaryInput) {
  const summary = await db.summary.findUnique({
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

  if (!summary) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Summary with ID ${input.id} not found`,
    })
  }

  return summary
}

export async function createSummary(db: PrismaClient, input: CreateSummaryInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveSummaryQuestionTypeId(db)

  return db.summary.create({
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

export async function updateSummary(db: PrismaClient, input: UpdateSummaryInput) {
  const { id, ...data } = input

  // Verify existence
  await getSummaryById(db, { id })
  const resolvedQuestionTypeId = await resolveSummaryQuestionTypeId(db)

  return db.summary.update({
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

export async function deleteSummary(db: PrismaClient, input: DeleteSummaryInput) {
  await getSummaryById(db, { id: input.id })

  return db.summary.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteSummaries(db: PrismaClient, input: BulkDeleteSummariesInput) {
  const res = await db.summary.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importSummaries(db: PrismaClient, input: ImportSummariesInput) {
  const resolvedQuestionTypeId = await resolveSummaryQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const s of input.summaries) {
        const data = s

        const createdSummary = await tx.summary.create({
          data: {
            title: data.title,
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            questionTypeId: resolvedQuestionTypeId,
          },
        })
        results.push(createdSummary)
      }
      return results
    },
    {
      timeout: 30000,
    }
  )

  return { importedCount: created.length }
}

export async function getSummaryStats(db: PrismaClient, input: SummaryStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.summary.count({ where }),
    db.summary.count({ where: { ...where, difficulty: "EASY" } }),
    db.summary.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.summary.count({ where: { ...where, difficulty: "HARD" } }),
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
