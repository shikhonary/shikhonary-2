import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateGrammarQuestionInput,
  DeleteGrammarQuestionInput,
  GetGrammarQuestionInput,
  ListGrammarQuestionInput,
  UpdateGrammarQuestionInput,
  BulkDeleteGrammarQuestionInput,
  ImportGrammarQuestionInput,
  GrammarQuestionStatsInput,
  ToggleGrammarQuestionActiveInput,
} from "./grammar-question.schema"

async function resolveGrammarQuestionTypeId(db: any, requestedTypeId?: string | null) {
  if (requestedTypeId) {
    const existing = await db.questionType.findUnique({
      where: { id: requestedTypeId },
      select: { id: true },
    })
    if (existing) return existing.id as string
  }

  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Grammar Question", mode: "insensitive" } },
        { label: { equals: "Grammar Question", mode: "insensitive" } },
        { nameEn: { equals: "GRAMMAR_QUESTION", mode: "insensitive" } },
        { nameBn: { equals: "ব্যাকরণ প্রশ্ন", mode: "insensitive" } },
        { nameBn: { contains: "ব্যাকরণ" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Grammar Question",
        nameBn: "ব্যাকরণ প্রশ্ন",
        label: "Grammar Question",
        mark: 5,
        position: 33,
        descriptionEn: "Grammar Question",
        descriptionBn: "ব্যাকরণ প্রশ্ন",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listGrammarQuestion(db: PrismaClient, input: ListGrammarQuestionInput) {
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
      { question: { contains: searchQuery, mode: "insensitive" } },
      { answer: { contains: searchQuery, mode: "insensitive" } },
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
  } else if (sort === "question_asc") {
    orderBy = { question: "asc" }
  } else if (sort === "question_desc") {
    orderBy = { question: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.grammarQuestion.findMany({
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
            classSubjects: {
              select: {
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
    db.grammarQuestion.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getGrammarQuestionById(db: PrismaClient, input: GetGrammarQuestionInput) {
  const item = await db.grammarQuestion.findUnique({
    where: { id: input.id },
    include: {
      subject: {
        include: {
          classSubjects: {
            include: {
              academicClass: true,
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
      message: `Grammar Question entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createGrammarQuestion(db: PrismaClient, input: CreateGrammarQuestionInput, userId?: string | null) {
  const data = input
  const resolvedQuestionTypeId = await resolveGrammarQuestionTypeId(db, data.questionTypeId)
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  return db.grammarQuestion.create({
    data: {
      question: data.question,
      answer: data.answer || null,
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

export async function updateGrammarQuestion(db: PrismaClient, input: UpdateGrammarQuestionInput, userId?: string | null) {
  const { id, ...data } = input

  await getGrammarQuestionById(db, { id })
  const resolvedQuestionTypeId = data.questionTypeId
    ? await resolveGrammarQuestionTypeId(db, data.questionTypeId)
    : undefined
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    ...(data.question !== undefined ? { question: data.question } : {}),
    ...(data.answer !== undefined ? { answer: data.answer || null } : {}),
    reference: data.reference,
    difficulty: data.difficulty,
    popularityCount: data.popularityCount,
    subjectId: data.subjectId,
    ...(resolvedQuestionTypeId ? { questionTypeId: resolvedQuestionTypeId } : {}),
    ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
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

  return db.grammarQuestion.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function deleteGrammarQuestion(db: PrismaClient, input: DeleteGrammarQuestionInput) {
  await getGrammarQuestionById(db, { id: input.id })

  return db.grammarQuestion.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteGrammarQuestion(db: PrismaClient, input: BulkDeleteGrammarQuestionInput) {
  const res = await db.grammarQuestion.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function toggleGrammarQuestionActive(
  db: PrismaClient,
  input: ToggleGrammarQuestionActiveInput
) {
  const item = await db.grammarQuestion.findUnique({
    where: { id: input.id },
    select: { id: true, isActive: true },
  })

  if (!item) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Grammar Question entry with ID ${input.id} not found`,
    })
  }

  return db.grammarQuestion.update({
    where: { id: input.id },
    data: { isActive: input.isActive },
    select: { id: true, isActive: true },
  })
}

export async function importGrammarQuestion(db: PrismaClient, input: ImportGrammarQuestionInput, userId?: string | null) {
  const currentYear = new Date().getFullYear().toString()

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const resolvedQuestionTypeId = await resolveGrammarQuestionTypeId(tx, data.questionTypeId)
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.grammarQuestion.create({
          data: {
            question: data.question,
            answer: data.answer || null,
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

export async function getGrammarQuestionStats(db: PrismaClient, input: GrammarQuestionStatsInput = {}) {
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
    db.grammarQuestion.count({ where }),
    db.grammarQuestion.count({ where: { ...where, isActive: true } }),
    db.grammarQuestion.count({ where: { ...where, isActive: false } }),
    db.grammarQuestion.count({ where: { ...where, difficulty: "EASY" } }),
    db.grammarQuestion.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.grammarQuestion.count({ where: { ...where, difficulty: "HARD" } }),
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

  const questions = await db.grammarQuestion.findMany({
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
