import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreatePoemInput,
  DeletePoemInput,
  GetPoemInput,
  ListPoemsInput,
  UpdatePoemInput,
  BulkDeletePoemsInput,
  ImportPoemsInput,
  PoemStatsInput,
} from "./poem.schema"

// Helper function to resolve 'Poem' question type ID
async function resolvePoemQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Poem", mode: "insensitive" } },
        { label: { equals: "Poem", mode: "insensitive" } },
        { nameEn: { equals: "Poetry", mode: "insensitive" } },
        { label: { equals: "Poetry", mode: "insensitive" } },
        { nameBn: { equals: "কবিতা", mode: "insensitive" } },
        { label: { equals: "কবিতা", mode: "insensitive" } },
        { nameBn: { equals: "কবিতাংশ", mode: "insensitive" } },
        { label: { equals: "কবিতাংশ", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Poem",
        nameBn: "কবিতা / কবিতাংশ",
        label: "Poem",
        mark: 10,
        position: 25,
        descriptionEn: "Poem / Poetry Writing & Analysis",
        descriptionBn: "কবিতা ও কবিতাংশ",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listPoems(db: PrismaClient, input: ListPoemsInput) {
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
    db.poem.findMany({
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
    db.poem.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getPoemById(db: PrismaClient, input: GetPoemInput) {
  const poem = await db.poem.findUnique({
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

  if (!poem) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Poem with ID ${input.id} not found`,
    })
  }

  return poem
}

export async function createPoem(db: PrismaClient, input: CreatePoemInput) {
  const data = input
  const resolvedQuestionTypeId = await resolvePoemQuestionTypeId(db)

  return db.poem.create({
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

export async function updatePoem(db: PrismaClient, input: UpdatePoemInput) {
  const { id, ...data } = input

  // Verify existence
  await getPoemById(db, { id })
  const resolvedQuestionTypeId = await resolvePoemQuestionTypeId(db)

  return db.poem.update({
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

export async function deletePoem(db: PrismaClient, input: DeletePoemInput) {
  await getPoemById(db, { id: input.id })

  return db.poem.delete({
    where: { id: input.id },
  })
}

export async function bulkDeletePoems(db: PrismaClient, input: BulkDeletePoemsInput) {
  const res = await db.poem.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importPoems(db: PrismaClient, input: ImportPoemsInput) {
  const resolvedQuestionTypeId = await resolvePoemQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const p of input.poems) {
        const data = p

        const createdPoem = await tx.poem.create({
          data: {
            title: data.title,
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            questionTypeId: resolvedQuestionTypeId,
          },
        })
        results.push(createdPoem)
      }
      return results
    },
    {
      timeout: 30000,
    }
  )

  return { importedCount: created.length }
}

export async function getPoemStats(db: PrismaClient, input: PoemStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.poem.count({ where }),
    db.poem.count({ where: { ...where, difficulty: "EASY" } }),
    db.poem.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.poem.count({ where: { ...where, difficulty: "HARD" } }),
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
