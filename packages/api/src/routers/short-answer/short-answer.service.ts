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
  if (source) where.source = source
  if (year !== undefined) where.year = year

  if (query) {
    where.OR = [
      { question: { contains: query, mode: "insensitive" } },
      { answer: { contains: query, mode: "insensitive" } },
      { source: { contains: query, mode: "insensitive" } },
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
        attachments: true,
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
      subject: true,
      chapter: true,
      questionType: true,
      attachments: true,
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

  return db.shortAnswer.create({
    data: {
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      question: data.question,
      answer: data.answer || null,
      difficulty: data.difficulty,
      year: data.year,
      source: data.source,
      reference: data.reference,
      questionTypeId: resolvedQuestionTypeId || undefined,
      isActive: data.isActive,
      attachments: allAttachments.length > 0
        ? {
          create: allAttachments.map((att) => ({
            url: att.url,
            type: att.type ?? "image",
            caption: att.caption ?? null,
            position: att.position ?? 0,
          })),
        }
        : undefined,
    } as any,
    include: {
      attachments: true,
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

  return db.shortAnswer.update({
    where: { id },
    data: {
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      question: data.question,
      answer: data.answer,
      difficulty: data.difficulty,
      year: data.year,
      source: data.source,
      reference: data.reference,
      questionTypeId: resolvedQuestionTypeId || undefined,
      isActive: data.isActive,
      attachments: allAttachments.length > 0
        ? {
          deleteMany: {},
          create: allAttachments.map((att) => ({
            url: att.url,
            type: att.type ?? "image",
            caption: att.caption ?? null,
            position: att.position ?? 0,
          })),
        }
        : { deleteMany: {} },
    } as any,
    include: {
      attachments: true,
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
    source: { not: null },
    year: { not: null },
  }

  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId

  const groups = await db.shortAnswer.groupBy({
    by: ["source", "year"],
    where,
    _count: { id: true },
  })

  return groups.map((g) => ({
    rawRef: `${g.source}-${g.year}`,
    boardName: g.source || "",
    year: g.year || 0,
    count: g._count.id,
  }))
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

        const createdSa = await tx.shortAnswer.create({
          data: {
            subjectId: data.subjectId,
            chapterId: data.chapterId,
            question: data.question,
            answer: data.answer || null,
            difficulty: data.difficulty ?? "MEDIUM",
            year: data.year,
            source: data.source,
            reference: data.reference || [],
            questionTypeId: resolvedQuestionTypeId || undefined,
            isActive: data.isActive ?? true,
            attachments: allAttachments.length > 0
              ? {
                create: allAttachments.map((att) => ({
                  url: att.url,
                  type: att.type ?? "image",
                  caption: att.caption ?? null,
                  position: att.position ?? 0,
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
