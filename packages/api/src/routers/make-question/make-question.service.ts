import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateMakeQuestionInput,
  DeleteMakeQuestionInput,
  GetMakeQuestionInput,
  ListMakeQuestionInput,
  UpdateMakeQuestionInput,
  BulkDeleteMakeQuestionInput,
  ImportMakeQuestionInput,
  MakeQuestionStatsInput,
  ToggleMakeQuestionActiveInput,
} from "./make-question.schema"

async function resolveMakeQuestionQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Make Question", mode: "insensitive" } },
        { label: { equals: "Make Question", mode: "insensitive" } },
        { nameEn: { equals: "Question Making", mode: "insensitive" } },
        { label: { equals: "Question Making", mode: "insensitive" } },
        { nameEn: { equals: "MAKE_QUESTION", mode: "insensitive" } },
        { nameBn: { equals: "প্রশ্ন তৈরি", mode: "insensitive" } },
        { nameBn: { contains: "প্রশ্ন তৈরি" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Make Question",
        nameBn: "প্রশ্ন তৈরি",
        label: "Make Question",
        mark: 5,
        position: 22,
        descriptionEn: "Make Question",
        descriptionBn: "প্রশ্ন তৈরি",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listMakeQuestion(db: PrismaClient, input: ListMakeQuestionInput) {
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
    essenceId,
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
  if (essenceId && essenceId !== "All") where.essenceId = essenceId
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
      { statement: { contains: searchQuery, mode: "insensitive" } },
      { answer: { contains: searchQuery, mode: "insensitive" } },
      { clue: { contains: searchQuery, mode: "insensitive" } },
      { context: { contains: searchQuery, mode: "insensitive" } },
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
  } else if (sort === "statement_asc") {
    orderBy = { statement: "asc" }
  } else if (sort === "statement_desc") {
    orderBy = { statement: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.makeQuestion.findMany({
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
        essence: {
          select: {
            id: true,
            title: true,
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
    db.makeQuestion.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getMakeQuestionById(db: PrismaClient, input: GetMakeQuestionInput) {
  const item = await db.makeQuestion.findUnique({
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
      essence: true,
      questionType: true,
    },
  })

  if (!item) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Make Question entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createMakeQuestion(db: PrismaClient, input: CreateMakeQuestionInput, userId?: string | null) {
  const data = input
  const resolvedQuestionTypeId = data.questionTypeId || (await resolveMakeQuestionQuestionTypeId(db))
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  return db.makeQuestion.create({
    data: {
      statement: data.statement || null,
      answer: data.answer || null,
      clue: data.clue || null,
      context: data.context || null,
      essenceId: data.essenceId || null,
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
      essence: true,
      questionType: true,
    },
  })
}

export async function updateMakeQuestion(db: PrismaClient, input: UpdateMakeQuestionInput, userId?: string | null) {
  const { id, ...data } = input

  await getMakeQuestionById(db, { id })
  const resolvedQuestionTypeId = data.questionTypeId || (await resolveMakeQuestionQuestionTypeId(db))
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    statement: data.statement !== undefined ? data.statement : undefined,
    answer: data.answer !== undefined ? data.answer : undefined,
    clue: data.clue !== undefined ? data.clue : undefined,
    context: data.context !== undefined ? data.context : undefined,
    essenceId: data.essenceId !== undefined ? data.essenceId : undefined,
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

  return db.makeQuestion.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      essence: true,
      questionType: true,
    },
  })
}

export async function deleteMakeQuestion(db: PrismaClient, input: DeleteMakeQuestionInput) {
  await getMakeQuestionById(db, { id: input.id })

  return db.makeQuestion.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteMakeQuestion(db: PrismaClient, input: BulkDeleteMakeQuestionInput) {
  const res = await db.makeQuestion.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function toggleMakeQuestionActive(
  db: PrismaClient,
  input: ToggleMakeQuestionActiveInput,
  userId?: string | null
) {
  await getMakeQuestionById(db, { id: input.id })

  return db.makeQuestion.update({
    where: { id: input.id },
    data: {
      isActive: input.isActive,
      ...(userId ? { updatedById: userId } : {}),
    },
    include: {
      subject: true,
      academicChapter: true,
      essence: true,
      questionType: true,
    },
  })
}

export async function importMakeQuestion(db: PrismaClient, input: ImportMakeQuestionInput, userId?: string | null) {
  const resolvedQuestionTypeId = await resolveMakeQuestionQuestionTypeId(db)
  const currentYear = new Date().getFullYear().toString()

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.makeQuestion.create({
          data: {
            statement: data.statement || null,
            answer: data.answer || null,
            clue: data.clue || null,
            context: data.context || null,
            essenceId: data.essenceId || null,
            reference: data.reference || [],
            source: data.source ? data.source.trim() : "গাইড বুক",
            session: currentYear,
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

export async function getMakeQuestionStats(db: PrismaClient, input: MakeQuestionStatsInput = {}) {
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
  if (input.essenceId && input.essenceId !== "All") where.essenceId = input.essenceId
  if (input.questionTypeId && input.questionTypeId !== "All") where.questionTypeId = input.questionTypeId

  const [totalCount, activeCount, inactiveCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.makeQuestion.count({ where }),
    db.makeQuestion.count({ where: { ...where, isActive: true } }),
    db.makeQuestion.count({ where: { ...where, isActive: false } }),
    db.makeQuestion.count({ where: { ...where, difficulty: "EASY" } }),
    db.makeQuestion.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.makeQuestion.count({ where: { ...where, difficulty: "HARD" } }),
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

  const questions = await db.makeQuestion.findMany({
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
