import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import {
  ListShortAnswersInput,
  ShortAnswerStatsInput,
  GetShortAnswerInput,
  CreateShortAnswerInput,
  UpdateShortAnswerInput,
  DeleteShortAnswerInput,
  BulkDeleteShortAnswersInput,
  ToggleShortAnswerActiveInput,
  ImportShortAnswersInput,
} from "./short-answer.schema"

export async function listShortAnswers(db: PrismaClient, input: ListShortAnswersInput) {
  const { page, limit, query, subjectId, chapterId, difficulty, source, session, year, board, isMath, sort } = input
  const skip = (page - 1) * limit

  const where: any = {}

  if (subjectId) where.subjectId = subjectId
  if (chapterId) where.chapterId = chapterId
  if (difficulty) where.difficulty = difficulty
  if (typeof isMath === "boolean") where.isMath = isMath

  if (source && year !== undefined) {
    const boardRef = [source, year].filter(Boolean).join("-")
    where.OR = [
      { AND: [{ source }, { session: String(year) }] },
      { reference: { has: boardRef } },
    ]
  } else {
    if (source) where.source = source
    if (session) where.session = session
    if (year !== undefined) {
      where.reference = { has: String(year) }
    }
  }

  if (board && !source) {
    where.reference = { has: board }
  }

  if (query) {
    const queryConditions: any[] = [
      { question: { contains: query, mode: "insensitive" } },
      { answer: { contains: query, mode: "insensitive" } },
      { source: { contains: query, mode: "insensitive" } },
      { session: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
    ]
    if (where.OR) {
      where.AND = [
        ...(where.AND || []),
        { OR: where.OR },
        { OR: queryConditions },
      ]
      delete where.OR
    } else {
      where.OR = queryConditions
    }
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "createdAt_asc" || sort === "oldest") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "createdAt_desc" || sort === "newest") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "question_asc") {
    orderBy = { question: "asc" }
  } else if (sort === "question_desc") {
    orderBy = { question: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.shortAnswer.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        subject: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
            code: true,
            group: true,
            classSubjects: {
              select: {
                academicClass: {
                  select: {
                    id: true,
                    nameBn: true,
                    nameEn: true,
                  },
                },
              },
            },
          },
        },
        chapter: {
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
        attachments: {
          orderBy: {
            position: "asc",
          },
        },
      },
    }),
    db.shortAnswer.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
  }
}

export async function getShortAnswerById(db: PrismaClient, input: GetShortAnswerInput) {
  const sa = await db.shortAnswer.findUnique({
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
      chapter: true,
      questionType: true,
      attachments: {
        orderBy: {
          position: "asc",
        },
      },
    },
  })

  if (!sa) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Short Answer with ID ${input.id} not found`,
    })
  }

  return sa
}

export async function createShortAnswer(db: PrismaClient, input: CreateShortAnswerInput) {
  const { attachments, ...data } = input
  const allAttachments = Array.isArray(attachments) ? [...attachments] : []

  let resolvedQuestionTypeId = data.questionTypeId
  if (!resolvedQuestionTypeId) {
    const qt = await db.questionType.findFirst({
      where: {
        OR: [
          { label: { contains: "Short Answer", mode: "insensitive" } },
          { nameEn: { contains: "Short Answer", mode: "insensitive" } },
          { label: { contains: "ShortAnswer", mode: "insensitive" } },
          { nameEn: { contains: "SA", mode: "insensitive" } },
        ],
        isActive: true,
        subjects: {
          some: {
            subjectId: data.subjectId,
          },
        },
      },
      select: { id: true },
    })
    if (qt) {
      resolvedQuestionTypeId = qt.id
    } else {
      const defaultSaQt = await db.questionType.findFirst({
        where: {
          OR: [
            { label: { contains: "Short Answer", mode: "insensitive" } },
            { nameEn: { contains: "Short Answer", mode: "insensitive" } },
            { label: { contains: "ShortAnswer", mode: "insensitive" } },
            { nameEn: { contains: "SA", mode: "insensitive" } },
          ],
          isActive: true,
        },
        select: { id: true },
      })
      if (defaultSaQt) {
        resolvedQuestionTypeId = defaultSaQt.id
      }
    }
  }

  const refList = Array.isArray(data.reference) ? [...data.reference] : []

  const currentYear = new Date().getFullYear().toString()
  const resolvedSource = data.source ? data.source.trim() : "সহায়ক সংকলন"
  const resolvedSession = data.session ? data.session.trim() : (data.year ? String(data.year) : currentYear)

  return db.shortAnswer.create({
    data: {
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      question: data.question,
      answer: data.answer || null,
      options: data.options || [],
      isMath: data.isMath ?? false,
      difficulty: data.difficulty,
      reference: refList,
      source: resolvedSource,
      session: resolvedSession,
      questionTypeId: resolvedQuestionTypeId || undefined,
      isActive: data.isActive,
      attachments: allAttachments.length > 0
        ? {
          create: allAttachments.map((att, idx) => ({
            type: att.type ?? "image",
            caption: att.caption ?? null,
            content: att.content ?? null,
            url: att.url ?? null,
            table: att.table ?? undefined,
            bottomContent: att.bottomContent ?? null,
            tableBorder: att.tableBorder ?? false,
            position: att.position !== undefined && att.position !== null ? att.position : idx,
          })),
        }
        : undefined,
    } as any,
    include: {
      attachments: {
        orderBy: {
          position: "asc",
        },
      },
    },
  })
}

export async function updateShortAnswer(db: PrismaClient, input: UpdateShortAnswerInput) {
  const { id, attachments, ...data } = input

  // Verify existence
  await getShortAnswerById(db, { id })

  const allAttachments = Array.isArray(attachments) ? [...attachments] : []

  let resolvedQuestionTypeId = data.questionTypeId
  if (!resolvedQuestionTypeId && data.subjectId) {
    const qt = await db.questionType.findFirst({
      where: {
        OR: [
          { label: { contains: "Short Answer", mode: "insensitive" } },
          { nameEn: { contains: "Short Answer", mode: "insensitive" } },
          { label: { contains: "ShortAnswer", mode: "insensitive" } },
          { nameEn: { contains: "SA", mode: "insensitive" } },
        ],
        isActive: true,
        subjects: {
          some: {
            subjectId: data.subjectId,
          },
        },
      },
      select: { id: true },
    })
    if (qt) {
      resolvedQuestionTypeId = qt.id
    }
  }

  const resolvedReference = data.reference !== undefined
    ? (Array.isArray(data.reference) ? data.reference : [])
    : undefined

  const currentYear = new Date().getFullYear().toString()
  const updateData: any = {
    subjectId: data.subjectId,
    chapterId: data.chapterId,
    question: data.question,
    answer: data.answer,
    options: data.options || [],
    isMath: data.isMath ?? false,
    difficulty: data.difficulty,
    reference: resolvedReference,
    questionTypeId: resolvedQuestionTypeId || undefined,
    isActive: data.isActive,
  }

  if (data.source !== undefined) {
    updateData.source = data.source ? data.source.trim() : null
  }
  if (data.session !== undefined) {
    updateData.session = data.session ? data.session.trim() : (data.year ? String(data.year) : currentYear)
  }

  return db.shortAnswer.update({
    where: { id },
    data: {
      ...updateData,
      attachments: allAttachments.length > 0
        ? {
          deleteMany: {},
          create: allAttachments.map((att, idx) => ({
            type: att.type ?? "image",
            caption: att.caption ?? null,
            content: att.content ?? null,
            url: att.url ?? null,
            table: att.table ?? undefined,
            bottomContent: att.bottomContent ?? null,
            tableBorder: att.tableBorder ?? false,
            position: att.position !== undefined && att.position !== null ? att.position : idx,
          })),
        }
        : { deleteMany: {} },
    } as any,
    include: {
      attachments: {
        orderBy: {
          position: "asc",
        },
      },
    },
  })
}

export async function deleteShortAnswer(db: PrismaClient, input: DeleteShortAnswerInput) {
  await getShortAnswerById(db, { id: input.id })

  return db.shortAnswer.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteShortAnswers(db: PrismaClient, input: BulkDeleteShortAnswersInput) {
  const res = await db.shortAnswer.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function toggleShortAnswerActive(db: PrismaClient, input: ToggleShortAnswerActiveInput) {
  await getShortAnswerById(db, { id: input.id })

  return db.shortAnswer.update({
    where: { id: input.id },
    data: { isActive: input.isActive },
  })
}

export async function getShortAnswerStats(db: PrismaClient, input: ShortAnswerStatsInput) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId

  const [totalCount, activeCount, inactiveCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.shortAnswer.count({ where }),
    db.shortAnswer.count({ where: { ...where, isActive: true } }),
    db.shortAnswer.count({ where: { ...where, isActive: false } }),
    db.shortAnswer.count({ where: { ...where, difficulty: "EASY" } }),
    db.shortAnswer.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.shortAnswer.count({ where: { ...where, difficulty: "HARD" } }),
  ])

  return {
    totalCount,
    activeCount,
    inactiveCount,
    difficultyCounts: {
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount,
    },
  }
}

export async function getShortAnswerBoardYears(
  db: PrismaClient,
  input: { subjectId?: string; chapterId?: string }
) {
  const where: any = {
    OR: [
      { NOT: { reference: { equals: [] } } },
      { AND: [{ source: { not: null } }, { session: { not: null } }] },
    ],
  }

  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId

  const questions = await db.shortAnswer.findMany({
    where,
    select: { reference: true, source: true, session: true },
  })

  const countMap = new Map<string, number>()
  for (const q of questions) {
    if (q.source && q.session) {
      const key = `${q.source}-${q.session}`
      countMap.set(key, (countMap.get(key) || 0) + 1)
    }
    for (const ref of q.reference || []) {
      if (!ref) continue
      if (q.source && q.session && ref === `${q.source}-${q.session}`) continue
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

export async function importShortAnswers(db: PrismaClient, input: ImportShortAnswersInput) {
  const defaultSaQt = await db.questionType.findFirst({
    where: {
      OR: [
        { label: { contains: "Short Answer", mode: "insensitive" } },
        { nameEn: { contains: "Short Answer", mode: "insensitive" } },
        { label: { contains: "ShortAnswer", mode: "insensitive" } },
        { nameEn: { contains: "SA", mode: "insensitive" } },
      ],
      isActive: true,
    },
    select: { id: true },
  })

  const subjectQtCache: Record<string, string> = {}

  const created = await db.$transaction(
    async (tx: any) => {
      const results = []
      for (const sa of input.shortAnswers) {
        const { attachments, ...data } = sa
        const allAttachments = Array.isArray(attachments) ? [...attachments] : []

        let resolvedQuestionTypeId = data.questionTypeId
        if (!resolvedQuestionTypeId && data.subjectId) {
          const subId = data.subjectId
          if (subjectQtCache[subId]) {
            resolvedQuestionTypeId = subjectQtCache[subId]
          } else {
            const qt = await tx.questionType.findFirst({
              where: {
                OR: [
                  { label: { contains: "Short Answer", mode: "insensitive" } },
                  { nameEn: { contains: "Short Answer", mode: "insensitive" } },
                  { label: { contains: "ShortAnswer", mode: "insensitive" } },
                  { nameEn: { contains: "SA", mode: "insensitive" } },
                ],
                isActive: true,
                subjects: {
                  some: {
                    subjectId: subId,
                  },
                },
              },
              select: { id: true },
            })
            if (qt) {
              resolvedQuestionTypeId = qt.id
              subjectQtCache[subId] = qt.id
            } else if (defaultSaQt) {
              resolvedQuestionTypeId = defaultSaQt.id
            }
          }
        }

        const refList = Array.isArray(data.reference) ? [...data.reference] : []

        const currentYear = new Date().getFullYear().toString()
        const resolvedSource = data.source ? data.source.trim() : "সহায়ক সংকলন"
        const resolvedSession = data.session ? data.session.trim() : (data.year ? String(data.year) : currentYear)

        const createdSa = await tx.shortAnswer.create({
          data: {
            subjectId: data.subjectId,
            chapterId: data.chapterId,
            question: data.question,
            answer: data.answer || null,
            options: data.options || [],
            isMath: data.isMath ?? false,
            difficulty: data.difficulty ?? "MEDIUM",
            reference: refList,
            source: resolvedSource,
            session: resolvedSession,
            questionTypeId: resolvedQuestionTypeId || undefined,
            isActive: data.isActive ?? true,
            attachments: allAttachments.length > 0
              ? {
                create: allAttachments.map((att, idx) => ({
                  type: att.type ?? "image",
                  caption: att.caption ?? null,
                  content: att.content ?? null,
                  url: att.url ?? null,
                  table: att.table ?? undefined,
                  bottomContent: att.bottomContent ?? null,
                  tableBorder: att.tableBorder ?? false,
                  position: att.position !== undefined && att.position !== null ? att.position : idx,
                })),
              }
              : undefined,
          } as any,
        })
        results.push(createdSa)
      }
      return results
    },
    { timeout: 30000 }
  )

  return { importedCount: created.length }
}
