import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateFillInTheBlanksWithoutCluesInput,
  DeleteFillInTheBlanksWithoutCluesInput,
  GetFillInTheBlanksWithoutCluesInput,
  ListFillInTheBlanksWithoutCluesInput,
  UpdateFillInTheBlanksWithoutCluesInput,
  BulkDeleteFillInTheBlanksWithoutCluesInput,
  ImportFillInTheBlanksWithoutCluesInput,
  FillInTheBlanksWithoutCluesStatsInput,
} from "./fill-in-the-blanks-without-clues.schema"

// Helper function to resolve 'Fill in the Blanks without Clues' question type ID
async function resolveFillInTheBlanksWithoutCluesQuestionTypeId(db: any) {
  const qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Fill in the Blanks without Clues", mode: "insensitive" } },
        { label: { equals: "Fill in the Blanks without Clues", mode: "insensitive" } },
        { nameEn: { equals: "FILL_IN_THE_BLANKS_WITHOUT_CLUES", mode: "insensitive" } },
        { nameEn: { equals: "Cloze Test without Clues", mode: "insensitive" } },
        { nameBn: { contains: "শূন্যস্থান পূরণ (ক্লু ছাড়া)" } },
        { nameBn: { contains: "ক্লু ছাড়া" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Required 'Fill in the Blanks without Clues' Question Type template was not found. Please create it under Question Types first.",
    })
  }

  return qt.id as string
}

export async function listFillInTheBlanksWithoutClues(db: PrismaClient, input: ListFillInTheBlanksWithoutCluesInput) {
  const { page, limit, query, subjectId, chapterId, academicChapterId, difficulty, source, session, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const targetChapterId = academicChapterId || chapterId
  const where: any = {}

  if (subjectId) where.subjectId = subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId
  if (difficulty) where.difficulty = difficulty
  if (source) where.source = source
  if (session) where.session = session

  if (query) {
    where.OR = [
      { content: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
      { options: { has: query } },
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
    db.fillInTheBlanksWithoutClues.findMany({
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
    db.fillInTheBlanksWithoutClues.count({ where }),
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

export async function getFillInTheBlanksWithoutCluesById(db: PrismaClient, input: GetFillInTheBlanksWithoutCluesInput) {
  const item = await db.fillInTheBlanksWithoutClues.findUnique({
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
      message: `Fill in the Blanks without Clues with ID ${input.id} not found`,
    })
  }

  return {
    ...item,
    chapter: item.academicChapter,
    chapterId: item.academicChapterId,
  }
}

export async function createFillInTheBlanksWithoutClues(
  db: PrismaClient,
  input: CreateFillInTheBlanksWithoutCluesInput,
  userId?: string | null
) {
  const data = input
  const resolvedQuestionTypeId = await resolveFillInTheBlanksWithoutCluesQuestionTypeId(db)
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  const created = await db.fillInTheBlanksWithoutClues.create({
    data: {
      content: data.content ? data.content.trim() : null,
      options: data.options ?? [],
      reference: data.reference ?? [],
      source: data.source ? data.source.trim() : "গাইড বুক",
      session: data.session ? data.session.trim() : currentYear,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      subjectId: data.subjectId,
      academicChapterId: targetChapterId,
      questionTypeId: resolvedQuestionTypeId,
      ...(userId ? { createdById: userId } : {}),
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

export async function updateFillInTheBlanksWithoutClues(
  db: PrismaClient,
  input: UpdateFillInTheBlanksWithoutCluesInput,
  userId?: string | null
) {
  const { id, ...data } = input

  const existing = await db.fillInTheBlanksWithoutClues.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Fill in the Blanks without Clues with ID ${id} not found`,
    })
  }

  const currentYear = new Date().getFullYear().toString()
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId

  const updateData: any = {
    reference: data.reference !== undefined ? data.reference : undefined,
    difficulty: data.difficulty !== undefined ? data.difficulty : undefined,
    popularityCount: data.popularityCount !== undefined ? data.popularityCount : undefined,
    subjectId: data.subjectId !== undefined ? data.subjectId : undefined,
    academicChapterId: targetChapterId !== undefined ? targetChapterId : undefined,
    ...(userId ? { updatedById: userId } : {}),
  }

  if (data.content !== undefined) {
    updateData.content = data.content ? data.content.trim() : null
  }

  if (data.options !== undefined) {
    updateData.options = data.options ?? []
  }

  if (data.source !== undefined) {
    updateData.source = data.source ? data.source.trim() : null
  }

  if (data.session !== undefined) {
    updateData.session = data.session ? data.session.trim() : currentYear
  }

  const updated = await db.fillInTheBlanksWithoutClues.update({
    where: { id },
    data: updateData,
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

export async function deleteFillInTheBlanksWithoutClues(db: PrismaClient, input: DeleteFillInTheBlanksWithoutCluesInput) {
  const existing = await db.fillInTheBlanksWithoutClues.findUnique({
    where: { id: input.id },
  })

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Fill in the Blanks without Clues with ID ${input.id} not found`,
    })
  }

  await db.fillInTheBlanksWithoutClues.delete({
    where: { id: input.id },
  })

  return { success: true, id: input.id }
}

export async function bulkDeleteFillInTheBlanksWithoutClues(db: PrismaClient, input: BulkDeleteFillInTheBlanksWithoutCluesInput) {
  const res = await db.fillInTheBlanksWithoutClues.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importFillInTheBlanksWithoutClues(
  db: PrismaClient,
  input: ImportFillInTheBlanksWithoutCluesInput,
  userId?: string | null
) {
  const resolvedQuestionTypeId = await resolveFillInTheBlanksWithoutCluesQuestionTypeId(db)
  const currentYear = new Date().getFullYear().toString()
  const fallbackSource = input.source?.trim() || "গাইড বুক"
  const fallbackSession = input.session?.trim() || currentYear

  const created = await db.$transaction(
    async (tx: any) => {
      const results = []
      for (const item of input.items) {
        const data = item
        const targetChapterId = data.academicChapterId || data.chapterId || null
        const itemSource = data.source ? data.source.trim() : fallbackSource
        const itemSession = data.session ? data.session.trim() : fallbackSession

        const createdItem = await tx.fillInTheBlanksWithoutClues.create({
          data: {
            content: data.content ? data.content.trim() : null,
            options: data.options ?? [],
            reference: data.reference || [],
            source: itemSource,
            session: itemSession,
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            academicChapterId: targetChapterId,
            questionTypeId: resolvedQuestionTypeId,
            ...(userId ? { createdById: userId } : {}),
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

export async function getFillInTheBlanksWithoutCluesStats(db: PrismaClient, input: FillInTheBlanksWithoutCluesStatsInput = {}) {
  const targetChapterId = input.academicChapterId || input.chapterId
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.fillInTheBlanksWithoutClues.count({ where }),
    db.fillInTheBlanksWithoutClues.count({ where: { ...where, difficulty: "EASY" } }),
    db.fillInTheBlanksWithoutClues.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.fillInTheBlanksWithoutClues.count({ where: { ...where, difficulty: "HARD" } }),
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
