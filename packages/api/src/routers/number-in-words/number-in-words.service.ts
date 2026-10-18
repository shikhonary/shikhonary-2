import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateNumberInWordsInput,
  DeleteNumberInWordsInput,
  GetNumberInWordsInput,
  ListNumberInWordsInput,
  UpdateNumberInWordsInput,
  BulkDeleteNumberInWordsInput,
  ImportNumberInWordsInput,
  NumberInWordsStatsInput,
  ToggleNumberInWordsActiveInput,
} from "./number-in-words.schema"

async function resolveNumberInWordsQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Number in Words", mode: "insensitive" } },
        { nameEn: { equals: "Numbers in Words", mode: "insensitive" } },
        { label: { equals: "Number in Words", mode: "insensitive" } },
        { label: { equals: "Numbers in Words", mode: "insensitive" } },
        { nameEn: { equals: "NUMBER_IN_WORDS", mode: "insensitive" } },
        { nameBn: { equals: "কথায় লেখ", mode: "insensitive" } },
        { nameBn: { equals: "কথায় লেখা", mode: "insensitive" } },
        { nameBn: { contains: "কথায় লেখ" } },
        { nameBn: { contains: "কথায় লেখা" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Number in Words",
        nameBn: "কথায় লেখ",
        label: "Number in Words",
        mark: 5,
        position: 45,
        descriptionEn: "Number in Words",
        descriptionBn: "সংখ্যা কথায় লেখা",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listNumberInWords(db: PrismaClient, input: ListNumberInWordsInput) {
  const {
    page,
    limit,
    query,
    subjectId,
    chapterId,
    academicChapterId,
    wordMeaningId,
    difficulty,
    source,
    session,
    board,
    isActive,
    sort,
  } = input

  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {
    deletedAt: null,
  }

  const targetChapterId = academicChapterId || chapterId

  if (subjectId) where.subjectId = subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId
  if (wordMeaningId) where.wordMeaningId = wordMeaningId
  if (difficulty) where.difficulty = difficulty
  if (source) where.source = source
  if (session) where.session = session
  if (isActive !== undefined) where.isActive = isActive

  if (board && board !== "All") {
    where.reference = { has: board }
  }

  if (query) {
    where.OR = [
      { number: { contains: query, mode: "insensitive" } },
      { inWords: { contains: query, mode: "insensitive" } },
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
  } else if (sort === "number_asc") {
    orderBy = { number: "asc" }
  } else if (sort === "number_desc") {
    orderBy = { number: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    (db as any).numberInWords.findMany({
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
        wordMeaning: {
          select: {
            id: true,
            word: true,
            meaning: true,
          },
        },
      },
    }),
    (db as any).numberInWords.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getNumberInWordsById(db: PrismaClient, input: GetNumberInWordsInput) {
  const item = await (db as any).numberInWords.findUnique({
    where: { id: input.id },
    include: {
      subject: {
        include: {
          classSubjects: true,
        },
      },
      academicChapter: true,
      questionType: true,
      wordMeaning: true,
    },
  })

  if (!item || item.deletedAt) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Number In Words entry with ID ${input.id} not found`,
    })
  }

  return item as {
    id: string
    number: string
    inWords: string
    reference: string[]
    source: string | null
    session: string | null
    difficulty: any
    popularityCount: number
    wordMeaningId: string | null
    subjectId: string
    academicChapterId: string | null
    questionTypeId: string
    isActive: boolean
    isGlobal: boolean
    createdAt: Date
    updatedAt: Date
    subject: any
    academicChapter: any
    questionType: any
    wordMeaning: any
  }
}

export async function createNumberInWords(
  db: PrismaClient,
  input: CreateNumberInWordsInput,
  userId?: string | null
) {
  const data = input
  const resolvedQuestionTypeId = await resolveNumberInWordsQuestionTypeId(db)
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  return (db as any).numberInWords.create({
    data: {
      number: data.number.trim(),
      inWords: data.inWords.trim(),
      reference: data.reference ?? [],
      source: data.source ? data.source.trim() : "গাইড বুক",
      session: data.session ? data.session.trim() : currentYear,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      wordMeaningId: data.wordMeaningId || null,
      subjectId: data.subjectId,
      academicChapterId: targetChapterId,
      questionTypeId: resolvedQuestionTypeId,
      isActive: data.isActive ?? true,
      ...(userId ? { createdById: userId } : {}),
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
      wordMeaning: true,
    },
  })
}

export async function updateNumberInWords(
  db: PrismaClient,
  input: UpdateNumberInWordsInput,
  userId?: string | null
) {
  const { id, ...data } = input

  await getNumberInWordsById(db, { id })
  const resolvedQuestionTypeId = await resolveNumberInWordsQuestionTypeId(db)
  const targetChapterId =
    data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    ...(data.number !== undefined ? { number: data.number.trim() } : {}),
    ...(data.inWords !== undefined ? { inWords: data.inWords.trim() } : {}),
    ...(data.reference !== undefined ? { reference: data.reference } : {}),
    ...(data.difficulty !== undefined ? { difficulty: data.difficulty } : {}),
    ...(data.popularityCount !== undefined ? { popularityCount: data.popularityCount } : {}),
    ...(data.wordMeaningId !== undefined ? { wordMeaningId: data.wordMeaningId || null } : {}),
    ...(data.subjectId !== undefined ? { subjectId: data.subjectId } : {}),
    ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
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

  return (db as any).numberInWords.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
      wordMeaning: true,
    },
  })
}

export async function toggleNumberInWordsActive(
  db: PrismaClient,
  input: ToggleNumberInWordsActiveInput
) {
  const { id, isActive } = input
  return (db as any).numberInWords.update({
    where: { id },
    data: { isActive },
  })
}

export async function deleteNumberInWords(db: PrismaClient, input: DeleteNumberInWordsInput) {
  await getNumberInWordsById(db, { id: input.id })

  return (db as any).numberInWords.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteNumberInWords(
  db: PrismaClient,
  input: BulkDeleteNumberInWordsInput
) {
  const res = await (db as any).numberInWords.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importNumberInWords(
  db: PrismaClient,
  input: ImportNumberInWordsInput,
  userId?: string | null
) {
  const resolvedQuestionTypeId = await resolveNumberInWordsQuestionTypeId(db)
  const currentYear = new Date().getFullYear().toString()

  const created = await (db as any).$transaction(
    async (tx: any) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.numberInWords.create({
          data: {
            number: data.number.trim(),
            inWords: data.inWords.trim(),
            reference: data.reference || [],
            source: data.source ? data.source.trim() : "গাইড বুক",
            session: data.session ? data.session.trim() : currentYear,
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            wordMeaningId: data.wordMeaningId || null,
            subjectId: data.subjectId,
            academicChapterId: targetChapterId,
            questionTypeId: resolvedQuestionTypeId,
            isActive: data.isActive ?? true,
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

export async function getNumberInWordsStats(
  db: PrismaClient,
  input: NumberInWordsStatsInput = {}
) {
  const where: any = { deletedAt: null }
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId
  if (input.wordMeaningId) where.wordMeaningId = input.wordMeaningId

  const [totalCount, activeCount, inactiveCount, easyCount, mediumCount, hardCount] =
    await Promise.all([
      (db as any).numberInWords.count({ where }),
      (db as any).numberInWords.count({ where: { ...where, isActive: true } }),
      (db as any).numberInWords.count({ where: { ...where, isActive: false } }),
      (db as any).numberInWords.count({ where: { ...where, difficulty: "EASY" } }),
      (db as any).numberInWords.count({ where: { ...where, difficulty: "MEDIUM" } }),
      (db as any).numberInWords.count({ where: { ...where, difficulty: "HARD" } }),
    ])

  return {
    total: totalCount,
    totalCount,
    active: activeCount,
    inactive: inactiveCount,
    byDifficulty: {
      EASY: easyCount,
      MEDIUM: mediumCount,
      HARD: hardCount,
    },
    difficultyCounts: {
      EASY: easyCount,
      MEDIUM: mediumCount,
      HARD: hardCount,
    },
  }
}

export async function getNumberInWordsBoardYears(
  db: PrismaClient,
  input: NumberInWordsStatsInput = {}
) {
  const where: any = { deletedAt: null }
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const records = await (db as any).numberInWords.findMany({
    where,
    select: { reference: true },
  })

  const set = new Set<string>()
  for (const r of records) {
    if (Array.isArray(r.reference)) {
      for (const ref of r.reference) {
        if (ref && typeof ref === "string" && ref.trim()) {
          set.add(ref.trim())
        }
      }
    }
  }

  return Array.from(set).sort()
}
