import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateFillInTheBlanksWithCluesInput,
  DeleteFillInTheBlanksWithCluesInput,
  GetFillInTheBlanksWithCluesInput,
  ListFillInTheBlanksWithCluesInput,
  UpdateFillInTheBlanksWithCluesInput,
  BulkDeleteFillInTheBlanksWithCluesInput,
  ImportFillInTheBlanksWithCluesInput,
  FillInTheBlanksWithCluesStatsInput,
} from "./fill-in-the-blanks-with-clues.schema"

// Helper function to resolve 'Fill in the Blanks with Clues' question type ID
async function resolveFillInTheBlanksWithCluesQuestionTypeId(db: any) {
  const qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Fill in the Blanks with Clues", mode: "insensitive" } },
        { label: { equals: "Fill in the Blanks with Clues", mode: "insensitive" } },
        { nameEn: { equals: "FILL_IN_THE_BLANKS_WITH_CLUES", mode: "insensitive" } },
        { nameEn: { equals: "Cloze Test with Clues", mode: "insensitive" } },
        { nameBn: { contains: "শূন্যস্থান পূরণ (ক্লুসহ)" } },
        { nameBn: { contains: "ক্লুসহ" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Required 'Fill in the Blanks with Clues' Question Type template was not found. Please create it under Question Types first.",
    })
  }

  return qt.id as string
}

export async function listFillInTheBlanksWithClues(db: PrismaClient, input: ListFillInTheBlanksWithCluesInput) {
  const { page, limit, query, subjectId, chapterId, difficulty, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}

  if (subjectId) where.subjectId = subjectId
  if (chapterId) where.academicChapterId = chapterId
  if (difficulty) where.difficulty = difficulty

  if (query) {
    where.OR = [
      { content: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
      { clues: { has: query } },
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
    db.fillInTheBlanksWithClues.findMany({
      where,
      orderBy,
      skip,
      take: resolvedLimit,
      include: {
        subject: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
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
    db.fillInTheBlanksWithClues.count({ where }),
  ])

  return {
    items: items.map((item) => ({
      ...item,
      chapter: item.academicChapter,
      chapterId: item.academicChapterId,
    })),
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getFillInTheBlanksWithCluesById(db: PrismaClient, input: GetFillInTheBlanksWithCluesInput) {
  const item = await db.fillInTheBlanksWithClues.findUnique({
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

  if (!item) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Fill in the Blanks with Clues with ID ${input.id} not found`,
    })
  }

  return {
    ...item,
    chapter: item.academicChapter,
    chapterId: item.academicChapterId,
  }
}

export async function createFillInTheBlanksWithClues(db: PrismaClient, input: CreateFillInTheBlanksWithCluesInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveFillInTheBlanksWithCluesQuestionTypeId(db)

  const created = await db.fillInTheBlanksWithClues.create({
    data: {
      content: data.content,
      clues: data.clues ?? [],
      reference: data.reference ?? [],
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      subjectId: data.subjectId,
      academicChapterId: data.chapterId || null,
      questionTypeId: resolvedQuestionTypeId,
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

export async function updateFillInTheBlanksWithClues(db: PrismaClient, input: UpdateFillInTheBlanksWithCluesInput) {
  const { id, ...data } = input

  const existing = await db.fillInTheBlanksWithClues.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Fill in the Blanks with Clues with ID ${id} not found`,
    })
  }

  const updated = await db.fillInTheBlanksWithClues.update({
    where: { id },
    data: {
      content: data.content !== undefined ? data.content : undefined,
      clues: data.clues !== undefined ? data.clues : undefined,
      reference: data.reference !== undefined ? data.reference : undefined,
      difficulty: data.difficulty !== undefined ? data.difficulty : undefined,
      popularityCount: data.popularityCount !== undefined ? data.popularityCount : undefined,
      subjectId: data.subjectId !== undefined ? data.subjectId : undefined,
      academicChapterId: data.chapterId !== undefined ? data.chapterId : undefined,
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

export async function deleteFillInTheBlanksWithClues(db: PrismaClient, input: DeleteFillInTheBlanksWithCluesInput) {
  const existing = await db.fillInTheBlanksWithClues.findUnique({
    where: { id: input.id },
  })

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Fill in the Blanks with Clues with ID ${input.id} not found`,
    })
  }

  await db.fillInTheBlanksWithClues.delete({
    where: { id: input.id },
  })

  return { success: true, id: input.id }
}

export async function bulkDeleteFillInTheBlanksWithClues(db: PrismaClient, input: BulkDeleteFillInTheBlanksWithCluesInput) {
  const res = await db.fillInTheBlanksWithClues.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importFillInTheBlanksWithClues(db: PrismaClient, input: ImportFillInTheBlanksWithCluesInput) {
  const resolvedQuestionTypeId = await resolveFillInTheBlanksWithCluesQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx: any) => {
      const results = []
      for (const item of input.items) {
        const data = item

        const createdItem = await tx.fillInTheBlanksWithClues.create({
          data: {
            content: data.content,
            clues: data.clues || [],
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            academicChapterId: data.chapterId || null,
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

export async function getFillInTheBlanksWithCluesStats(db: PrismaClient, input: FillInTheBlanksWithCluesStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.academicChapterId = input.chapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.fillInTheBlanksWithClues.count({ where }),
    db.fillInTheBlanksWithClues.count({ where: { ...where, difficulty: "EASY" } }),
    db.fillInTheBlanksWithClues.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.fillInTheBlanksWithClues.count({ where: { ...where, difficulty: "HARD" } }),
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
