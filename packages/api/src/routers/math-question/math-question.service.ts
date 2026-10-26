import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateMathQuestionInput,
  DeleteMathQuestionInput,
  GetMathQuestionInput,
  ListMathQuestionInput,
  UpdateMathQuestionInput,
  BulkDeleteMathQuestionInput,
  ImportMathQuestionInput,
  MathQuestionStatsInput,
  ToggleMathQuestionActiveInput,
} from "./math-question.schema"

async function resolveMathQuestionTypeId(db: any, requestedTypeId?: string | null) {
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
        { nameEn: { equals: "Math Question", mode: "insensitive" } },
        { label: { equals: "Math Question", mode: "insensitive" } },
        { nameEn: { equals: "MATH_QUESTION", mode: "insensitive" } },
        { nameBn: { equals: "গণিত প্রশ্ন", mode: "insensitive" } },
        { nameBn: { contains: "গণিত" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Math Question",
        nameBn: "গণিত প্রশ্ন",
        label: "Math Question",
        mark: 5,
        position: 34,
        descriptionEn: "Math Question",
        descriptionBn: "গণিত প্রশ্ন",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listMathQuestion(db: PrismaClient, input: ListMathQuestionInput) {
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
    isMath,
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
  if (typeof isMath === "boolean") where.isMath = isMath

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
    db.mathQuestion.findMany({
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
    db.mathQuestion.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getMathQuestionById(db: PrismaClient, input: GetMathQuestionInput) {
  const item = await db.mathQuestion.findUnique({
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
      message: `Math Question entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createMathQuestion(db: PrismaClient, input: CreateMathQuestionInput, userId?: string | null) {
  const data = input
  const resolvedQuestionTypeId = await resolveMathQuestionTypeId(db, data.questionTypeId)
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  return db.mathQuestion.create({
    data: {
      question: data.question,
      answer: data.answer || null,
      isMath: data.isMath ?? false,
      reference: data.reference ?? [],
      source: data.source ? data.source.trim() : "পাঠ্যবই",
      session: data.session ? data.session.trim() : currentYear,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
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
    },
  })
}

export async function updateMathQuestion(db: PrismaClient, input: UpdateMathQuestionInput, userId?: string | null) {
  const { id, ...data } = input

  await getMathQuestionById(db, { id })
  const resolvedQuestionTypeId = data.questionTypeId
    ? await resolveMathQuestionTypeId(db, data.questionTypeId)
    : undefined
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    ...(data.question !== undefined ? { question: data.question } : {}),
    ...(data.answer !== undefined ? { answer: data.answer || null } : {}),
    ...(data.isMath !== undefined ? { isMath: data.isMath } : {}),
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

  return db.mathQuestion.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function toggleMathQuestionActive(db: PrismaClient, input: ToggleMathQuestionActiveInput) {
  const { id, isActive } = input
  return db.mathQuestion.update({
    where: { id },
    data: { isActive },
    select: { id: true, isActive: true },
  })
}

export async function deleteMathQuestion(db: PrismaClient, input: DeleteMathQuestionInput) {
  await getMathQuestionById(db, { id: input.id })

  await db.mathQuestion.delete({
    where: { id: input.id },
  })

  return { success: true, id: input.id }
}

export async function bulkDeleteMathQuestion(db: PrismaClient, input: BulkDeleteMathQuestionInput) {
  const { ids } = input

  const deleteResult = await db.mathQuestion.deleteMany({
    where: {
      id: { in: ids },
    },
  })

  return {
    success: true,
    deletedCount: deleteResult.count,
  }
}

export async function importMathQuestion(
  db: PrismaClient,
  input: ImportMathQuestionInput,
  userId?: string | null
) {
  const resolvedQuestionTypeId = await resolveMathQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.mathQuestion.create({
          data: {
            question: data.question,
            answer: data.answer || null,
            isMath: data.isMath ?? false,
            reference: data.reference ?? [],
            source: data.source ? data.source.trim() : "পাঠ্যবই",
            session: data.session ? data.session.trim() : new Date().getFullYear().toString(),
            difficulty: data.difficulty,
            popularityCount: data.popularityCount ?? 0,
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

export async function getMathQuestionStats(db: PrismaClient, input: MathQuestionStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.academicClassId && input.academicClassId !== "All") {
    where.subject = {
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

  const [totalCount, activeCount, inactiveCount, mathCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.mathQuestion.count({ where }),
    db.mathQuestion.count({ where: { ...where, isActive: true } }),
    db.mathQuestion.count({ where: { ...where, isActive: false } }),
    db.mathQuestion.count({ where: { ...where, isMath: true } }),
    db.mathQuestion.count({ where: { ...where, difficulty: "EASY" } }),
    db.mathQuestion.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.mathQuestion.count({ where: { ...where, difficulty: "HARD" } }),
  ])

  return {
    totalCount,
    activeCount,
    inactiveCount,
    mathCount,
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

  const questions = await db.mathQuestion.findMany({
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
