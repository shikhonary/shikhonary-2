import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateOppositeWordInput,
  DeleteOppositeWordInput,
  GetOppositeWordInput,
  ListOppositeWordInput,
  UpdateOppositeWordInput,
  BulkDeleteOppositeWordInput,
  ImportOppositeWordInput,
  OppositeWordStatsInput,
} from "./opposite-word.schema"

async function resolveOppositeWordQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Opposite Word", mode: "insensitive" } },
        { label: { equals: "Opposite Word", mode: "insensitive" } },
        { nameEn: { equals: "OPPOSITE_WORD", mode: "insensitive" } },
        { nameBn: { equals: "বিপরীত শব্দ", mode: "insensitive" } },
        { nameBn: { contains: "বিপরীত শব্দ" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Opposite Word",
        nameBn: "বিপরীত শব্দ",
        label: "Opposite Word",
        mark: 5,
        position: 22,
        descriptionEn: "Opposite Word Questions",
        descriptionBn: "বিপরীত শব্দ প্রশ্নসমূহ",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listOppositeWord(db: PrismaClient, input: ListOppositeWordInput) {
  const { page, limit, query, subjectId, chapterId, academicChapterId, difficulty, source, session, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}
  const targetChapterId = academicChapterId || chapterId

  if (subjectId) where.subjectId = subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId
  if (difficulty) where.difficulty = difficulty
  if (source) where.source = source
  if (session) where.session = session

  if (query) {
    where.OR = [
      { word: { contains: query, mode: "insensitive" } },
      { oppositeWord: { contains: query, mode: "insensitive" } },
      { oppositeWords: { has: query } },
      { source: { contains: query, mode: "insensitive" } },
      { session: { contains: query, mode: "insensitive" } },
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
    db.oppositeWord.findMany({
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
    db.oppositeWord.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getOppositeWordById(db: PrismaClient, input: GetOppositeWordInput) {
  const item = await db.oppositeWord.findUnique({
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
      message: `Opposite Word entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createOppositeWord(db: PrismaClient, input: CreateOppositeWordInput, userId?: string | null) {
  const data = input
  const resolvedQuestionTypeId = await resolveOppositeWordQuestionTypeId(db)
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  return db.oppositeWord.create({
    data: {
      word: data.word,
      oppositeWord: data.oppositeWord || null,
      oppositeWords: data.oppositeWords ?? [],
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
}

export async function updateOppositeWord(db: PrismaClient, input: UpdateOppositeWordInput, userId?: string | null) {
  const { id, ...data } = input

  await getOppositeWordById(db, { id })
  const resolvedQuestionTypeId = await resolveOppositeWordQuestionTypeId(db)
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    word: data.word,
    oppositeWord: data.oppositeWord !== undefined ? data.oppositeWord : undefined,
    oppositeWords: data.oppositeWords,
    reference: data.reference,
    difficulty: data.difficulty,
    popularityCount: data.popularityCount,
    subjectId: data.subjectId,
    questionTypeId: resolvedQuestionTypeId,
    ...(userId ? { updatedById: userId } : {}),
  }

  if (data.source !== undefined) {
    updateData.source = data.source ? data.source.trim() : null
  }

  if (data.session !== undefined) {
    updateData.session = data.session ? data.session.trim() : currentYear
  }

  if (targetChapterId !== undefined) {
    updateData.academicChapterId = targetChapterId || null
  }

  return db.oppositeWord.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function deleteOppositeWord(db: PrismaClient, input: DeleteOppositeWordInput) {
  await getOppositeWordById(db, { id: input.id })

  return db.oppositeWord.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteOppositeWord(db: PrismaClient, input: BulkDeleteOppositeWordInput) {
  const res = await db.oppositeWord.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importOppositeWord(db: PrismaClient, input: ImportOppositeWordInput, userId?: string | null) {
  const resolvedQuestionTypeId = await resolveOppositeWordQuestionTypeId(db)
  const currentYear = new Date().getFullYear().toString()

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.oppositeWord.create({
          data: {
            word: data.word,
            oppositeWord: data.oppositeWord || null,
            oppositeWords: data.oppositeWords || [],
            reference: data.reference || [],
            source: data.source ? data.source.trim() : "গাইড বুক",
            session: currentYear,
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

export async function getOppositeWordStats(db: PrismaClient, input: OppositeWordStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.oppositeWord.count({ where }),
    db.oppositeWord.count({ where: { ...where, difficulty: "EASY" } }),
    db.oppositeWord.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.oppositeWord.count({ where: { ...where, difficulty: "HARD" } }),
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
