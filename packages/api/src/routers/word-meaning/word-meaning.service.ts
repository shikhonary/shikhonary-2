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
  ToggleWordMeaningActiveInput,
  WordMeaningBoardYearsInput,
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
  const {
    page,
    limit,
    query,
    search,
    academicClassId,
    classId,
    subjectId,
    chapterId,
    academicChapterId,
    questionTypeId,
    difficulty,
    source,
    session,
    year,
    board,
    isActive,
    sort,
  } = input

  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}
  const targetChapterId = academicChapterId || chapterId
  const targetClassId = academicClassId || classId

  if (targetClassId && targetClassId !== "All") {
    where.subject = {
      ...where.subject,
      classSubjects: {
        some: {
          academicClassId: targetClassId,
        },
      },
    }
  }

  if (subjectId && subjectId !== "All") where.subjectId = subjectId
  if (targetChapterId && targetChapterId !== "All") where.academicChapterId = targetChapterId
  if (questionTypeId && questionTypeId !== "All") where.questionTypeId = questionTypeId
  if (difficulty && difficulty !== "All") where.difficulty = difficulty
  if (typeof isActive === "boolean") where.isActive = isActive

  if (board && board !== "All") {
    where.OR = [
      { reference: { has: board } },
      { source: { contains: board, mode: "insensitive" } },
    ]
  }

  if (source && source !== "All" && year !== undefined) {
    const boardRef = [source, year].filter(Boolean).join("-")
    const existingOr = where.OR || []
    where.OR = [
      ...existingOr,
      { AND: [{ source }, { session: String(year) }] },
      { reference: { has: boardRef } },
    ]
  } else if (source && source !== "All") {
    where.source = source
  }

  if (session && !year && session !== "All") where.session = session

  const searchQuery = search || query
  if (searchQuery) {
    const searchFilter = [
      { word: { contains: searchQuery, mode: "insensitive" } },
      { meaning: { contains: searchQuery, mode: "insensitive" } },
      { source: { contains: searchQuery, mode: "insensitive" } },
      { session: { contains: searchQuery, mode: "insensitive" } },
      { reference: { has: searchQuery } },
    ]

    if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: searchFilter }]
      delete where.OR
    } else {
      where.OR = searchFilter
    }
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
          include: {
            classSubjects: {
              include: {
                academicClass: {
                  select: {
                    id: true,
                    nameEn: true,
                    nameBn: true,
                  },
                },
              },
            },
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
          classSubjects: {
            include: {
              academicClass: {
                select: {
                  id: true,
                  nameEn: true,
                  nameBn: true,
                },
              },
            },
          },
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

export async function createWordMeaning(
  db: PrismaClient,
  input: CreateWordMeaningInput,
  userId?: string | null
) {
  const data = input
  const resolvedQuestionTypeId = data.questionTypeId || (await resolveWordMeaningQuestionTypeId(db))
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  return db.wordMeaning.create({
    data: {
      word: data.word,
      meaning: data.meaning || null,
      reference: data.reference ?? [],
      source: data.source ? data.source.trim() : "গাইড বুক",
      session: data.session ? data.session.trim() : currentYear,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      subjectId: data.subjectId,
      academicChapterId: targetChapterId,
      questionTypeId: resolvedQuestionTypeId,
      isActive: data.isActive !== undefined ? data.isActive : true,
      ...(userId ? { createdById: userId } : {}),
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function updateWordMeaning(
  db: PrismaClient,
  input: UpdateWordMeaningInput,
  userId?: string | null
) {
  const { id, ...data } = input

  await getWordMeaningById(db, { id })
  const resolvedQuestionTypeId = data.questionTypeId || (await resolveWordMeaningQuestionTypeId(db))
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId

  const updateData: any = {
    word: data.word,
    meaning: data.meaning !== undefined ? data.meaning : undefined,
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
    updateData.session = data.session ? data.session.trim() : null
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive
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

export async function toggleWordMeaningActive(
  db: PrismaClient,
  input: ToggleWordMeaningActiveInput,
  userId?: string | null
) {
  await getWordMeaningById(db, { id: input.id })

  return db.wordMeaning.update({
    where: { id: input.id },
    data: {
      isActive: input.isActive,
      ...(userId ? { updatedById: userId } : {}),
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function importWordMeaning(
  db: PrismaClient,
  input: ImportWordMeaningInput,
  userId?: string | null
) {
  const resolvedQuestionTypeId = await resolveWordMeaningQuestionTypeId(db)
  const currentYear = new Date().getFullYear().toString()

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
            source: data.source ? data.source.trim() : "গাইড বুক",
            session: data.session ? data.session.trim() : currentYear,
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            academicChapterId: targetChapterId,
            questionTypeId: resolvedQuestionTypeId,
            isActive: data.isActive !== undefined ? data.isActive : true,
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

export async function getWordMeaningStats(db: PrismaClient, input: WordMeaningStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId
  const targetClassId = input.academicClassId || input.classId

  if (targetClassId && targetClassId !== "All") {
    where.subject = {
      ...where.subject,
      classSubjects: {
        some: {
          academicClassId: targetClassId,
        },
      },
    }
  }

  if (input.subjectId && input.subjectId !== "All") where.subjectId = input.subjectId
  if (targetChapterId && targetChapterId !== "All") where.academicChapterId = targetChapterId

  const [totalCount, activeCount, inactiveCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.wordMeaning.count({ where }),
    db.wordMeaning.count({ where: { ...where, isActive: true } }),
    db.wordMeaning.count({ where: { ...where, isActive: false } }),
    db.wordMeaning.count({ where: { ...where, difficulty: "EASY" } }),
    db.wordMeaning.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.wordMeaning.count({ where: { ...where, difficulty: "HARD" } }),
  ])

  return {
    totalCount,
    activeCount,
    inactiveCount,
    difficultyCounts: {
      EASY: easyCount,
      MEDIUM: mediumCount,
      HARD: hardCount,
    },
  }
}

export async function getWordMeaningBoardYears(
  db: PrismaClient,
  input: WordMeaningBoardYearsInput = {}
) {
  const where: any = {}
  if (input.subjectId && input.subjectId !== "All") where.subjectId = input.subjectId
  if (input.chapterId && input.chapterId !== "All") where.academicChapterId = input.chapterId

  const items = await db.wordMeaning.findMany({
    where,
    select: {
      source: true,
      session: true,
      reference: true,
    },
  })

  const boardYearSet = new Set<string>()

  for (const item of items) {
    if (item.source && item.session) {
      boardYearSet.add(`${item.source}-${item.session}`)
    }
    if (Array.isArray(item.reference)) {
      for (const ref of item.reference) {
        if (ref && ref.trim()) {
          boardYearSet.add(ref.trim())
        }
      }
    }
  }

  return Array.from(boardYearSet).sort((a, b) => b.localeCompare(a, "bn"))
}
