import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateWordMeaningInput,
  DeleteWordMeaningInput,
  GetWordMeaningInput,
  ListWordMeaningInput,
  UpdateWordMeaningInput,
  BulkDeleteWordMeaningInput,
  ImportWordMeaningInput,
  WordMeaningStatsInput,
} from "./word-meaning.schema"

async function resolveWordMeaningQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Word Meaning", mode: "insensitive" } },
        { label: { equals: "Word Meaning", mode: "insensitive" } },
        { nameEn: { equals: "WORD_MEANING", mode: "insensitive" } },
        { nameBn: { equals: "শব্দার্থ", mode: "insensitive" } },
        { nameBn: { contains: "শব্দার্থ" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Word Meaning",
        nameBn: "শব্দার্থ",
        label: "Word Meaning",
        mark: 5,
        position: 21,
        descriptionEn: "Word Meaning",
        descriptionBn: "শব্দার্থ",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listWordMeaning(db: PrismaClient, input: ListWordMeaningInput) {
  const { page, limit, query, subjectId, chapterId, academicChapterId, difficulty, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}
  const targetChapterId = academicChapterId || chapterId

  if (subjectId) where.subjectId = subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId
  if (difficulty) where.difficulty = difficulty

  if (query) {
    where.OR = [
      { word: { contains: query, mode: "insensitive" } },
      { meaning: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "newest" || sort === "createdAt_desc") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "oldest" || sort === "createdAt_asc") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "word_asc") {
    orderBy = { word: "asc" }
  } else if (sort === "word_desc") {
    orderBy = { word: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.wordMeaning.findMany({
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
    db.wordMeaning.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getWordMeaningById(db: PrismaClient, input: GetWordMeaningInput) {
  const item = await db.wordMeaning.findUnique({
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
      message: `Word Meaning entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createWordMeaning(db: PrismaClient, input: CreateWordMeaningInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveWordMeaningQuestionTypeId(db)
  const targetChapterId = data.academicChapterId || data.chapterId || null

  return db.wordMeaning.create({
    data: {
      word: data.word,
      meaning: data.meaning || null,
      reference: data.reference ?? [],
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      subjectId: data.subjectId,
      academicChapterId: targetChapterId,
      questionTypeId: resolvedQuestionTypeId,
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function updateWordMeaning(db: PrismaClient, input: UpdateWordMeaningInput) {
  const { id, ...data } = input

  await getWordMeaningById(db, { id })
  const resolvedQuestionTypeId = await resolveWordMeaningQuestionTypeId(db)
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId

  const updateData: any = {
    word: data.word,
    meaning: data.meaning !== undefined ? data.meaning : undefined,
    reference: data.reference,
    difficulty: data.difficulty,
    popularityCount: data.popularityCount,
    subjectId: data.subjectId,
    questionTypeId: resolvedQuestionTypeId,
  }

  if (targetChapterId !== undefined) {
    updateData.academicChapterId = targetChapterId
  }

  return db.wordMeaning.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function deleteWordMeaning(db: PrismaClient, input: DeleteWordMeaningInput) {
  await getWordMeaningById(db, { id: input.id })

  return db.wordMeaning.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteWordMeaning(db: PrismaClient, input: BulkDeleteWordMeaningInput) {
  const res = await db.wordMeaning.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importWordMeaning(db: PrismaClient, input: ImportWordMeaningInput) {
  const resolvedQuestionTypeId = await resolveWordMeaningQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.wordMeaning.create({
          data: {
            word: data.word,
            meaning: data.meaning || null,
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            academicChapterId: targetChapterId,
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

export async function getWordMeaningStats(db: PrismaClient, input: WordMeaningStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.wordMeaning.count({ where }),
    db.wordMeaning.count({ where: { ...where, difficulty: "EASY" } }),
    db.wordMeaning.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.wordMeaning.count({ where: { ...where, difficulty: "HARD" } }),
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
