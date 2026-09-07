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
  const { page, limit, query, subjectId, chapterId, difficulty, source, year, sort } = input
  const skip = (page - 1) * limit

  const where: any = {}

  if (subjectId) where.subjectId = subjectId
  if (chapterId) where.chapterId = chapterId
  if (difficulty) where.difficulty = difficulty
  if (source || year !== undefined) {
    const boardRef = [source, year].filter(Boolean).join("-")
    if (boardRef) {
      where.reference = { has: boardRef }
    }
  }

  if (query) {
    where.OR = [
      { question: { contains: query, mode: "insensitive" } },
      { answer: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "createdAt_asc") {
    orderBy = { createdAt: "asc" }
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
          classSubjects: true,
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
  if (data.source || data.year) {
    const legacyRef = [data.source, data.year].filter(Boolean).join("-")
    if (legacyRef && !refList.includes(legacyRef)) {
      refList.push(legacyRef)
    }
  }

  return db.shortAnswer.create({
    data: {
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      question: data.question,
      answer: data.answer || null,
      difficulty: data.difficulty,
      reference: refList,
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

  let resolvedReference = data.reference
  if (data.source || data.year) {
    const legacyRef = [data.source, data.year].filter(Boolean).join("-")
    if (legacyRef) {
      const currentRefs = Array.isArray(data.reference) ? [...data.reference] : []
      if (!currentRefs.includes(legacyRef)) {
        currentRefs.push(legacyRef)
      }
      resolvedReference = currentRefs
    }
  }

  return db.shortAnswer.update({
    where: { id },
    data: {
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      question: data.question,
      answer: data.answer,
      difficulty: data.difficulty,
      reference: resolvedReference,
      questionTypeId: resolvedQuestionTypeId || undefined,
      isActive: data.isActive,
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
    NOT: { reference: { equals: [] } },
  }

  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId

  const questions = await db.shortAnswer.findMany({
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
        if (data.source || data.year) {
          const legacyRef = [data.source, data.year].filter(Boolean).join("-")
          if (legacyRef && !refList.includes(legacyRef)) {
            refList.push(legacyRef)
          }
        }

        const createdSa = await tx.shortAnswer.create({
          data: {
            subjectId: data.subjectId,
            chapterId: data.chapterId,
            question: data.question,
            answer: data.answer || null,
            difficulty: data.difficulty ?? "MEDIUM",
            reference: refList,
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
