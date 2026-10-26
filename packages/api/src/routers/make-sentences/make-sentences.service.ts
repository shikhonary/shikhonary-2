import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateMakeSentencesInput,
  DeleteMakeSentencesInput,
  GetMakeSentencesInput,
  ListMakeSentencesInput,
  UpdateMakeSentencesInput,
  BulkDeleteMakeSentencesInput,
  ImportMakeSentencesInput,
  MakeSentencesStatsInput,
  ToggleMakeSentencesActiveInput,
} from "./make-sentences.schema"

async function resolveMakeSentencesQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Make Sentences", mode: "insensitive" } },
        { label: { equals: "Make Sentences", mode: "insensitive" } },
        { nameEn: { equals: "Sentence Making", mode: "insensitive" } },
        { label: { equals: "Sentence Making", mode: "insensitive" } },
        { nameEn: { equals: "MAKE_SENTENCES", mode: "insensitive" } },
        { nameBn: { equals: "বাক্য গঠন", mode: "insensitive" } },
        { nameBn: { contains: "বাক্য গঠন" } },
        { nameBn: { contains: "বাক্য তৈরি" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Make Sentences",
        nameBn: "বাক্য গঠন",
        label: "Make Sentences",
        mark: 5,
        position: 19,
        descriptionEn: "Make Sentences",
        descriptionBn: "বাক্য গঠন",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listMakeSentences(db: PrismaClient, input: ListMakeSentencesInput) {
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
    db.makeSentences.findMany({
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
    db.makeSentences.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getMakeSentencesById(db: PrismaClient, input: GetMakeSentencesInput) {
  const item = await db.makeSentences.findUnique({
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
      message: `Make Sentences word entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createMakeSentences(db: PrismaClient, input: CreateMakeSentencesInput, userId?: string | null) {
  const data = input
  const resolvedQuestionTypeId = data.questionTypeId || (await resolveMakeSentencesQuestionTypeId(db))
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  return db.makeSentences.create({
    data: {
      word: data.word,
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

export async function updateMakeSentences(db: PrismaClient, input: UpdateMakeSentencesInput, userId?: string | null) {
  const { id, ...data } = input

  await getMakeSentencesById(db, { id })
  const resolvedQuestionTypeId = data.questionTypeId || (await resolveMakeSentencesQuestionTypeId(db))
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    word: data.word,
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
    updateData.academicChapterId = targetChapterId
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive
  }

  return db.makeSentences.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function deleteMakeSentences(db: PrismaClient, input: DeleteMakeSentencesInput) {
  await getMakeSentencesById(db, { id: input.id })

  return db.makeSentences.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteMakeSentences(db: PrismaClient, input: BulkDeleteMakeSentencesInput) {
  const res = await db.makeSentences.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function toggleMakeSentencesActive(
  db: PrismaClient,
  input: ToggleMakeSentencesActiveInput,
  userId?: string | null
) {
  await getMakeSentencesById(db, { id: input.id })

  return db.makeSentences.update({
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

export async function importMakeSentences(db: PrismaClient, input: ImportMakeSentencesInput, userId?: string | null) {
  const resolvedQuestionTypeId = await resolveMakeSentencesQuestionTypeId(db)
  const currentYear = new Date().getFullYear().toString()

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.makeSentences.create({
          data: {
            word: data.word,
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

export async function getMakeSentencesStats(db: PrismaClient, input: MakeSentencesStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.academicClassId && input.academicClassId !== "All") {
    where.subject = {
      ...where.subject,
      classSubjects: {
        some: {
          academicClassId: input.academicClassId,
        },
      },
    }
  }

  if (input.subjectId && input.subjectId !== "All") where.subjectId = input.subjectId
  if (targetChapterId && targetChapterId !== "All") where.academicChapterId = targetChapterId
  if (input.questionTypeId && input.questionTypeId !== "All") where.questionTypeId = input.questionTypeId

  const [totalCount, activeCount, inactiveCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.makeSentences.count({ where }),
    db.makeSentences.count({ where: { ...where, isActive: true } }),
    db.makeSentences.count({ where: { ...where, isActive: false } }),
    db.makeSentences.count({ where: { ...where, difficulty: "EASY" } }),
    db.makeSentences.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.makeSentences.count({ where: { ...where, difficulty: "HARD" } }),
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

export async function getBoardYears(
  db: PrismaClient,
  input: { subjectId: string; chapterId?: string; academicChapterId?: string }
) {
  const where: any = {
    subjectId: input.subjectId,
    NOT: { reference: { equals: [] } },
  }
  const targetChapterId = input.academicChapterId || input.chapterId
  if (targetChapterId && targetChapterId !== "All") where.academicChapterId = targetChapterId

  const questions = await db.makeSentences.findMany({
    where,
    select: { reference: true },
  })

  const countMap = new Map<string, number>()
  for (const q of questions) {
    for (const ref of q.reference || []) {
      if (!ref) continue
      countMap.set(ref, (countMap.get(ref) || 0) + 1)
    }
  }

  return Array.from(countMap.entries()).map(([rawRef, count]) => {
    const parts = rawRef.split("-")
    const yearStr = parts[parts.length - 1]
    const year = !isNaN(Number(yearStr)) ? Number(yearStr) : 0
    const boardName = parts.length > 1 ? parts.slice(0, parts.length - 1).join("-") : rawRef
    return {
      rawRef,
      boardName,
      year,
      count,
    }
  })
}
