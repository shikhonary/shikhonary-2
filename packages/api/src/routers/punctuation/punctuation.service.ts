import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreatePunctuationInput,
  DeletePunctuationInput,
  GetPunctuationInput,
  ListPunctuationInput,
  UpdatePunctuationInput,
  BulkDeletePunctuationInput,
  ImportPunctuationInput,
  PunctuationStatsInput,
} from "./punctuation.schema"

// Helper function to resolve 'Punctuation' question type ID
async function resolvePunctuationQuestionTypeId(db: any) {
  const qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Punctuation and Capitalization", mode: "insensitive" } },
        { nameEn: { equals: "Punctuation", mode: "insensitive" } },
        { label: { equals: "Punctuation and Capitalization", mode: "insensitive" } },
        { label: { equals: "Punctuation", mode: "insensitive" } },
        { nameEn: { equals: "PUNCTUATION", mode: "insensitive" } },
        { nameBn: { contains: "বিরাম চিহ্ন" } },
        { nameBn: { contains: "যতিচিহ্ন" } },
        { nameBn: { contains: "Punctuation" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Required 'Punctuation and Capitalization' Question Type template was not found. Please create it under Question Types first.",
    })
  }

  return qt.id as string
}

export async function listPunctuations(db: PrismaClient, input: ListPunctuationInput) {
  const { page, limit, query, subjectId, difficulty, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}

  if (subjectId) where.subjectId = subjectId
  if (difficulty) where.difficulty = difficulty

  if (query) {
    where.OR = [
      { content: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "newest" || sort === "createdAt_desc") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "oldest" || sort === "createdAt_asc") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "content_asc" || sort === "name_asc") {
    orderBy = { content: "asc" }
  } else if (sort === "content_desc" || sort === "name_desc") {
    orderBy = { content: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    (db as any).punctuation.findMany({
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
    (db as any).punctuation.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit),
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getPunctuationById(db: PrismaClient, input: GetPunctuationInput) {
  const punctuation = await (db as any).punctuation.findUnique({
    where: { id: input.id },
    include: {
      subject: true,
      questionType: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  if (!punctuation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Punctuation not found",
    })
  }

  return punctuation
}

export async function createPunctuation(db: PrismaClient, input: CreatePunctuationInput) {
  const resolvedQuestionTypeId = await resolvePunctuationQuestionTypeId(db)

  const created = await (db as any).punctuation.create({
    data: {
      content: input.content,
      reference: input.reference || [],
      difficulty: input.difficulty,
      popularityCount: input.popularityCount,
      subjectId: input.subjectId,
      questionTypeId: resolvedQuestionTypeId,
    },
    include: {
      subject: true,
      questionType: true,
    },
  })

  return created
}

export async function updatePunctuation(db: PrismaClient, input: UpdatePunctuationInput) {
  const { id, ...data } = input
  await getPunctuationById(db, { id })
  const resolvedQuestionTypeId = await resolvePunctuationQuestionTypeId(db)

  const updated = await (db as any).punctuation.update({
    where: { id },
    data: {
      ...data,
      questionTypeId: resolvedQuestionTypeId,
    },
    include: {
      subject: true,
      questionType: true,
    },
  })

  return updated
}

export async function deletePunctuation(db: PrismaClient, input: DeletePunctuationInput) {
  await getPunctuationById(db, { id: input.id })

  return (db as any).punctuation.delete({
    where: { id: input.id },
  })
}

export async function bulkDeletePunctuations(db: PrismaClient, input: BulkDeletePunctuationInput) {
  const res = await (db as any).punctuation.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })

  return { count: res.count }
}

export async function importPunctuations(db: PrismaClient, input: ImportPunctuationInput) {
  const resolvedQuestionTypeId = await resolvePunctuationQuestionTypeId(db)

  return db.$transaction(async (tx) => {
    const results = []

    for (const p of input.punctuations) {
      const createdItem = await (tx as any).punctuation.create({
        data: {
          content: p.content,
          reference: p.reference || [],
          difficulty: p.difficulty,
          popularityCount: p.popularityCount,
          subjectId: p.subjectId,
          questionTypeId: resolvedQuestionTypeId,
        },
      })
      results.push(createdItem)
    }

    return {
      count: results.length,
      items: results,
    }
  })
}

export async function getPunctuationsStats(db: PrismaClient, input: PunctuationStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId

  const [total, easy, medium, hard] = await Promise.all([
    (db as any).punctuation.count({ where }),
    (db as any).punctuation.count({ where: { ...where, difficulty: "EASY" } }),
    (db as any).punctuation.count({ where: { ...where, difficulty: "MEDIUM" } }),
    (db as any).punctuation.count({ where: { ...where, difficulty: "HARD" } }),
  ])

  return {
    total,
    easy,
    medium,
    hard,
  }
}
