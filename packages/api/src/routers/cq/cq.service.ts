import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateCqInput,
  DeleteCqInput,
  GetCqInput,
  ListCqsInput,
  UpdateCqInput,
  BulkDeleteCqsInput,
  ToggleCqActiveInput,
  ImportCqsInput,
  CqStatsInput,
} from "./cq.schema"

export async function listCqs(db: PrismaClient, input: ListCqsInput) {
  const where: any = {}
  
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId
  if (input.difficulty) where.difficulty = input.difficulty

  if (input.board) {
    const parts = input.board.split("-")
    const yearPart = parts[parts.length - 1]
    const sourcePart = parts.slice(0, parts.length - 1).join("-")
    if (sourcePart && yearPart && !isNaN(Number(yearPart))) {
      where.source = sourcePart
      where.year = Number(yearPart)
    }
  }

  if (input.query) {
    where.OR = [
      { questionA: { contains: input.query, mode: "insensitive" } },
      { questionB: { contains: input.query, mode: "insensitive" } },
      { questionC: { contains: input.query, mode: "insensitive" } },
      { questionD: { contains: input.query, mode: "insensitive" } },
      { context: { contains: input.query, mode: "insensitive" } },
      { source: { contains: input.query, mode: "insensitive" } },
      {
        answer: {
          explanation: { contains: input.query, mode: "insensitive" },
        },
      },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (input.sort === "newest") {
    orderBy = { createdAt: "desc" }
  } else if (input.sort === "oldest") {
    orderBy = { createdAt: "asc" }
  } else if (input.sort === "context_asc") {
    orderBy = { context: "asc" }
  } else if (input.sort === "context_desc") {
    orderBy = { context: "desc" }
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = (page - 1) * limit

  const [items, totalItems] = await Promise.all([
    db.cq.findMany({
      where,
      take: limit,
      skip,
      orderBy,
      include: {
        subject: {
          select: {
            id: true,
            nameBn: true,
            nameEn: true,
            code: true,
            group: true,
          },
        },
        chapter: {
          select: {
            id: true,
            nameBn: true,
            nameEn: true,
            position: true,
          },
        },
        questionType: {
          select: {
            id: true,
            nameBn: true,
            nameEn: true,
            label: true,
            mark: true,
          },
        },
        answer: true,
        attachments: true,
      },
    }),
    db.cq.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
  }
}

export async function getCqById(db: PrismaClient, input: GetCqInput) {
  const cq = await db.cq.findUnique({
    where: { id: input.id },
    include: {
      subject: {
        include: {
          classSubjects: true,
        },
      },
      chapter: true,
      questionType: true,
      answer: true,
      attachments: true,
    },
  })

  if (!cq) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `CQ with ID ${input.id} not found`,
    })
  }

  return cq
}

export async function createCq(db: PrismaClient, input: CreateCqInput) {
  const { attachments, answer, ...data } = input
  const allAttachments = Array.isArray(attachments) ? [...attachments] : []
  if (data.context && data.context.trim()) {
    allAttachments.push({
      url: "text-context",
      type: "text",
      caption: data.context.trim(),
      position: 99,
    })
  }

  let resolvedQuestionTypeId = data.questionTypeId
  if (!resolvedQuestionTypeId) {
    const qt = await db.questionType.findFirst({
      where: {
        OR: [
          { label: { contains: "CQ", mode: "insensitive" } },
          { nameEn: { contains: "CQ", mode: "insensitive" } },
          { label: { contains: "Creative", mode: "insensitive" } },
          { nameEn: { contains: "Creative", mode: "insensitive" } },
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
      const defaultCqQt = await db.questionType.findFirst({
        where: {
          OR: [
            { label: { contains: "CQ", mode: "insensitive" } },
            { nameEn: { contains: "CQ", mode: "insensitive" } },
            { label: { contains: "Creative", mode: "insensitive" } },
            { nameEn: { contains: "Creative", mode: "insensitive" } },
          ],
          isActive: true,
        },
        select: { id: true },
      })
      if (defaultCqQt) {
        resolvedQuestionTypeId = defaultCqQt.id
      }
    }
  }

  // Create standard 10-mark distribution if not specified
  const marksDistribution = data.marks || { a: 1, b: 2, c: 3, d: data.questionD ? 4 : 0 }

  return db.cq.create({
    data: {
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      questionA: data.questionA,
      questionB: data.questionB,
      questionC: data.questionC,
      questionD: data.questionD || null,
      context: data.context || null,
      reference: data.reference,
      difficulty: data.difficulty,
      year: data.year,
      source: data.source,
      marks: marksDistribution,
      questionTypeId: resolvedQuestionTypeId || undefined,
      isActive: data.isActive,
      answer: answer
        ? {
            create: {
              answerA: answer.answerA || null,
              answerB: answer.answerB || null,
              answerC: answer.answerC || null,
              answerD: answer.answerD || null,
              explanation: answer.explanation || null,
            },
          }
        : undefined,
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
      answer: true,
      attachments: true,
    },
  })
}

export async function updateCq(db: PrismaClient, input: UpdateCqInput) {
  const { id, attachments, answer, ...data } = input
  
  // Verify existence
  await getCqById(db, { id })

  const allAttachments = Array.isArray(attachments) ? [...attachments] : []
  if (data.context && data.context.trim()) {
    allAttachments.push({
      url: "text-context",
      type: "text",
      caption: data.context.trim(),
      position: 99,
    })
  }

  let resolvedQuestionTypeId = data.questionTypeId
  if (!resolvedQuestionTypeId && data.subjectId) {
    const qt = await db.questionType.findFirst({
      where: {
        OR: [
          { label: { contains: "CQ", mode: "insensitive" } },
          { nameEn: { contains: "CQ", mode: "insensitive" } },
          { label: { contains: "Creative", mode: "insensitive" } },
          { nameEn: { contains: "Creative", mode: "insensitive" } },
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

  // Create standard marks distribution if questionD changes
  let marksDistribution = data.marks
  if (!marksDistribution && (data.questionD !== undefined)) {
    marksDistribution = { a: 1, b: 2, c: 3, d: data.questionD ? 4 : 0 }
  }

  return db.cq.update({
    where: { id },
    data: {
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      questionA: data.questionA,
      questionB: data.questionB,
      questionC: data.questionC,
      questionD: data.questionD,
      context: data.context,
      reference: data.reference,
      difficulty: data.difficulty,
      year: data.year,
      source: data.source,
      marks: marksDistribution || undefined,
      questionTypeId: resolvedQuestionTypeId || undefined,
      isActive: data.isActive,
      answer: answer
        ? {
            upsert: {
              create: {
                answerA: answer.answerA || null,
                answerB: answer.answerB || null,
                answerC: answer.answerC || null,
                answerD: answer.answerD || null,
                explanation: answer.explanation || null,
              },
              update: {
                answerA: answer.answerA !== undefined ? answer.answerA : undefined,
                answerB: answer.answerB !== undefined ? answer.answerB : undefined,
                answerC: answer.answerC !== undefined ? answer.answerC : undefined,
                answerD: answer.answerD !== undefined ? answer.answerD : undefined,
                explanation: answer.explanation !== undefined ? answer.explanation : undefined,
              },
            },
          }
        : undefined,
      attachments: allAttachments.length > 0 ? {
        deleteMany: {},
        create: allAttachments.map((att) => ({
          url: att.url,
          type: att.type ?? "image",
          caption: att.caption ?? null,
          position: att.position ?? 0,
        })),
      } : undefined,
    } as any,
    include: {
      answer: true,
      attachments: true,
    },
  })
}

export async function deleteCq(db: PrismaClient, input: DeleteCqInput) {
  await getCqById(db, { id: input.id })

  return db.cq.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteCqs(db: PrismaClient, input: BulkDeleteCqsInput) {
  const res = await db.cq.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function toggleCqActive(db: PrismaClient, input: ToggleCqActiveInput) {
  await getCqById(db, { id: input.id })

  return db.cq.update({
    where: { id: input.id },
    data: { isActive: input.isActive },
  })
}

export async function importCqs(db: PrismaClient, input: ImportCqsInput) {
  const defaultCqQt = await db.questionType.findFirst({
    where: {
      OR: [
        { label: { contains: "CQ", mode: "insensitive" } },
        { nameEn: { contains: "CQ", mode: "insensitive" } },
        { label: { contains: "Creative", mode: "insensitive" } },
        { nameEn: { contains: "Creative", mode: "insensitive" } },
      ],
      isActive: true,
    },
    select: { id: true },
  })

  const subjectQtCache: Record<string, string> = {}

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const cq of input.cqs) {
        const { attachments, answer, ...data } = cq
        const allAttachments = Array.isArray(attachments) ? [...attachments] : []
        if (data.context && data.context.trim()) {
          allAttachments.push({
            url: "text-context",
            type: "text",
            caption: data.context.trim(),
            position: 99,
          })
        }

        let resolvedQuestionTypeId = data.questionTypeId
        if (!resolvedQuestionTypeId) {
          const subId = data.subjectId
          if (subjectQtCache[subId]) {
            resolvedQuestionTypeId = subjectQtCache[subId]
          } else {
            const qt = await tx.questionType.findFirst({
              where: {
                OR: [
                  { label: { contains: "CQ", mode: "insensitive" } },
                  { nameEn: { contains: "CQ", mode: "insensitive" } },
                  { label: { contains: "Creative", mode: "insensitive" } },
                  { nameEn: { contains: "Creative", mode: "insensitive" } },
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
            } else if (defaultCqQt) {
              resolvedQuestionTypeId = defaultCqQt.id
            }
          }
        }

        const marksDistribution = data.marks || { a: 1, b: 2, c: 3, d: data.questionD ? 4 : 0 }

        const createdCq = await tx.cq.create({
          data: {
            subjectId: data.subjectId,
            chapterId: data.chapterId,
            questionA: data.questionA,
            questionB: data.questionB,
            questionC: data.questionC,
            questionD: data.questionD || null,
            context: data.context || null,
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            year: data.year,
            source: data.source,
            marks: marksDistribution,
            questionTypeId: resolvedQuestionTypeId || undefined,
            isActive: data.isActive ?? true,
            answer: answer
              ? {
                  create: {
                    answerA: answer.answerA || null,
                    answerB: answer.answerB || null,
                    answerC: answer.answerC || null,
                    answerD: answer.answerD || null,
                    explanation: answer.explanation || null,
                  },
                }
              : undefined,
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
        results.push(createdCq)
      }
      return results
    },
    {
      timeout: 30000,
    }
  )

  return { importedCount: created.length }
}

export async function getCqStats(db: PrismaClient, input: CqStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId

  const [totalCount, activeCount, inactiveCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.cq.count({ where }),
    db.cq.count({ where: { ...where, isActive: true } }),
    db.cq.count({ where: { ...where, isActive: false } }),
    db.cq.count({ where: { ...where, difficulty: "EASY" } }),
    db.cq.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.cq.count({ where: { ...where, difficulty: "HARD" } }),
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
  input: { subjectId: string; chapterId?: string }
) {
  const where: any = {
    subjectId: input.subjectId,
    source: { not: null },
    year: { not: null },
  }
  if (input.chapterId) where.chapterId = input.chapterId

  const groups = await db.cq.groupBy({
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
