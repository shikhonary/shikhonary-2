import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateShortCompositionInput,
  DeleteShortCompositionInput,
  GetShortCompositionInput,
  ListShortCompositionInput,
  UpdateShortCompositionInput,
  BulkDeleteShortCompositionInput,
  ImportShortCompositionInput,
  ShortCompositionStatsInput,
} from "./short-composition.schema"

// Helper function to resolve 'Short Composition' question type ID
async function resolveShortCompositionQuestionTypeId(db: any) {
  const qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Short Composition", mode: "insensitive" } },
        { nameEn: { equals: "Composition", mode: "insensitive" } },
        { label: { equals: "Short Composition", mode: "insensitive" } },
        { label: { equals: "Composition", mode: "insensitive" } },
        { nameEn: { equals: "SHORT_COMPOSITION", mode: "insensitive" } },
        { nameBn: { contains: "কম্পোজিশন" } },
        { nameBn: { contains: "Short Composition" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Required 'Short Composition' Question Type template was not found. Please create it under Question Types first.",
    })
  }

  return qt.id as string
}

export async function listShortCompositions(db: PrismaClient, input: ListShortCompositionInput) {
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
    (db as any).shortComposition.findMany({
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
    (db as any).shortComposition.count({ where }),
  ])

  const totalPages = Math.ceil(totalItems / resolvedLimit)

  return {
    items,
    pagination: {
      page: resolvedPage,
      limit: resolvedLimit,
      totalItems,
      totalPages,
      hasNextPage: resolvedPage < totalPages,
      hasPreviousPage: resolvedPage > 1,
    },
  }
}

export async function getShortCompositionStats(db: PrismaClient, input: ShortCompositionStatsInput) {
  const { subjectId } = input
  const where: any = {}
  if (subjectId) where.subjectId = subjectId

  const [total, easy, medium, hard] = await Promise.all([
    (db as any).shortComposition.count({ where }),
    (db as any).shortComposition.count({ where: { ...where, difficulty: "EASY" } }),
    (db as any).shortComposition.count({ where: { ...where, difficulty: "MEDIUM" } }),
    (db as any).shortComposition.count({ where: { ...where, difficulty: "HARD" } }),
  ])

  return {
    total,
    easy,
    medium,
    hard,
  }
}

export async function getShortCompositionById(db: PrismaClient, input: GetShortCompositionInput) {
  const item = await (db as any).shortComposition.findUnique({
    where: { id: input.id },
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
  })

  if (!item) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Short Composition question not found",
    })
  }

  return item
}

export async function createShortComposition(
  db: PrismaClient,
  input: CreateShortCompositionInput,
  userId?: string,
  tenantId?: string
) {
  const questionTypeId = await resolveShortCompositionQuestionTypeId(db)

  return (db as any).shortComposition.create({
    data: {
      title: input.title.trim(),
      wordLimit: input.wordLimit ?? null,
      reference: input.reference || [],
      difficulty: input.difficulty,
      popularityCount: input.popularityCount ?? 0,
      subjectId: input.subjectId,
      questionTypeId,
      createdById: userId,
      updatedById: userId,
      tenantId: tenantId,
      isGlobal: !tenantId,
    },
    include: {
      subject: true,
      questionType: true,
    },
  })
}

export async function updateShortComposition(
  db: PrismaClient,
  input: UpdateShortCompositionInput,
  userId?: string
) {
  const existing = await (db as any).shortComposition.findUnique({
    where: { id: input.id },
  })

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Short Composition question not found",
    })
  }

  const data: any = {
    updatedById: userId,
  }

  if (input.title !== undefined) data.title = input.title.trim()
  if (input.wordLimit !== undefined) data.wordLimit = input.wordLimit
  if (input.reference !== undefined) data.reference = input.reference
  if (input.difficulty !== undefined) data.difficulty = input.difficulty
  if (input.popularityCount !== undefined) data.popularityCount = input.popularityCount
  if (input.subjectId !== undefined) data.subjectId = input.subjectId

  return (db as any).shortComposition.update({
    where: { id: input.id },
    data,
    include: {
      subject: true,
      questionType: true,
    },
  })
}

export async function deleteShortComposition(db: PrismaClient, input: DeleteShortCompositionInput) {
  const existing = await (db as any).shortComposition.findUnique({
    where: { id: input.id },
  })

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Short Composition question not found",
    })
  }

  return (db as any).shortComposition.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteShortCompositions(
  db: PrismaClient,
  input: BulkDeleteShortCompositionInput
) {
  const res = await (db as any).shortComposition.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })

  return {
    count: res.count,
  }
}

export async function bulkImportShortCompositions(
  db: PrismaClient,
  input: ImportShortCompositionInput,
  userId?: string,
  tenantId?: string
) {
  const questionTypeId = await resolveShortCompositionQuestionTypeId(db)

  const records = input.shortCompositions.map((item) => ({
    title: item.title.trim(),
    wordLimit: item.wordLimit ?? null,
    reference: item.reference || [],
    difficulty: item.difficulty || "MEDIUM",
    popularityCount: item.popularityCount ?? 0,
    subjectId: item.subjectId,
    questionTypeId,
    createdById: userId,
    updatedById: userId,
    tenantId,
    isGlobal: !tenantId,
  }))

  const res = await (db as any).shortComposition.createMany({
    data: records,
  })

  return {
    count: res.count,
  }
}
