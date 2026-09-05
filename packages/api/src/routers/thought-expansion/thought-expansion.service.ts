import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateThoughtExpansionInput,
  DeleteThoughtExpansionInput,
  GetThoughtExpansionInput,
  ListThoughtExpansionsInput,
  UpdateThoughtExpansionInput,
  BulkDeleteThoughtExpansionsInput,
  ImportThoughtExpansionsInput,
  ThoughtExpansionStatsInput,
} from "./thought-expansion.schema"

// Helper function to resolve 'Thought Expansion' question type ID
async function resolveThoughtExpansionQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Thought Expansion", mode: "insensitive" } },
        { label: { equals: "Thought Expansion", mode: "insensitive" } },
        { nameEn: { equals: "Thought-Expansion", mode: "insensitive" } },
        { label: { equals: "Thought-Expansion", mode: "insensitive" } },
        { nameEn: { equals: "Amplification", mode: "insensitive" } },
        { label: { equals: "Amplification", mode: "insensitive" } },
        { nameBn: { equals: "ভাব-সম্প্রসারণ", mode: "insensitive" } },
        { label: { equals: "ভাব-সম্প্রসারণ", mode: "insensitive" } },
        { nameBn: { equals: "ভাবসম্প্রসারণ", mode: "insensitive" } },
        { label: { equals: "ভাবসম্প্রসারণ", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Thought Expansion",
        nameBn: "ভাব-সম্প্রসারণ",
        label: "Thought Expansion",
        mark: 10,
        position: 13,
        descriptionEn: "Thought Expansion / Amplification of ideas",
        descriptionBn: "ভাব-সম্প্রসারণ লিখন",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listThoughtExpansions(db: PrismaClient, input: ListThoughtExpansionsInput) {
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
    db.thoughtExpansion.findMany({
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
    db.thoughtExpansion.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getThoughtExpansionById(db: PrismaClient, input: GetThoughtExpansionInput) {
  const thoughtExpansion = await db.thoughtExpansion.findUnique({
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

  if (!thoughtExpansion) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Thought Expansion with ID ${input.id} not found`,
    })
  }

  return thoughtExpansion
}

export async function createThoughtExpansion(db: PrismaClient, input: CreateThoughtExpansionInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveThoughtExpansionQuestionTypeId(db)

  return db.thoughtExpansion.create({
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

export async function updateThoughtExpansion(db: PrismaClient, input: UpdateThoughtExpansionInput) {
  const { id, ...data } = input

  // Verify existence
  await getThoughtExpansionById(db, { id })
  const resolvedQuestionTypeId = await resolveThoughtExpansionQuestionTypeId(db)

  return db.thoughtExpansion.update({
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

export async function deleteThoughtExpansion(db: PrismaClient, input: DeleteThoughtExpansionInput) {
  await getThoughtExpansionById(db, { id: input.id })

  return db.thoughtExpansion.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteThoughtExpansions(db: PrismaClient, input: BulkDeleteThoughtExpansionsInput) {
  const res = await db.thoughtExpansion.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importThoughtExpansions(db: PrismaClient, input: ImportThoughtExpansionsInput) {
  const resolvedQuestionTypeId = await resolveThoughtExpansionQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const t of input.thoughtExpansions) {
        const data = t

        const createdItem = await tx.thoughtExpansion.create({
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

export async function getThoughtExpansionStats(db: PrismaClient, input: ThoughtExpansionStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.thoughtExpansion.count({ where }),
    db.thoughtExpansion.count({ where: { ...where, difficulty: "EASY" } }),
    db.thoughtExpansion.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.thoughtExpansion.count({ where: { ...where, difficulty: "HARD" } }),
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
