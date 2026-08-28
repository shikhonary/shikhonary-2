import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateMcqInput,
  DeleteMcqInput,
  GetMcqInput,
  ListMcqsInput,
  UpdateMcqInput,
  BulkDeleteMcqsInput,
  ToggleMcqActiveInput,
  ImportMcqsInput,
  McqStatsInput,
} from "./mcq.schema"

export async function listMcqs(db: PrismaClient, input: ListMcqsInput) {
  const where: any = {}
  
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId
  if (input.type) where.type = input.type

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
      { question: { contains: input.query, mode: "insensitive" } },
      { explanation: { contains: input.query, mode: "insensitive" } },
      { source: { contains: input.query, mode: "insensitive" } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (input.sort === "newest") {
    orderBy = { createdAt: "desc" }
  } else if (input.sort === "oldest") {
    orderBy = { createdAt: "asc" }
  } else if (input.sort === "question_asc") {
    orderBy = { question: "asc" }
  } else if (input.sort === "question_desc") {
    orderBy = { question: "desc" }
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = (page - 1) * limit

  const [items, totalItems] = await Promise.all([
    db.mcq.findMany({
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
        attachments: true,
      },
    }),
    db.mcq.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
  }
}

export async function getMcqById(db: PrismaClient, input: GetMcqInput) {
  const mcq = await db.mcq.findUnique({
    where: { id: input.id },
    include: {
      subject: true,
      chapter: true,
      questionType: true,
    },
  })

  if (!mcq) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `MCQ with ID ${input.id} not found`,
    })
  }

  return mcq
}

export async function createMcq(db: PrismaClient, input: CreateMcqInput) {
  const { attachments, context, ...data } = input
  const allAttachments = Array.isArray(attachments) ? [...attachments] : []
  if (context && context.trim()) {
    allAttachments.push({
      url: "text-context",
      type: "text",
      caption: context.trim(),
      position: 99,
    })
  }

  let resolvedQuestionTypeId = data.questionTypeId
  if (!resolvedQuestionTypeId) {
    const qt = await db.questionType.findFirst({
      where: {
        OR: [
          { label: { contains: "MCQ", mode: "insensitive" } },
          { nameEn: { contains: "MCQ", mode: "insensitive" } },
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
      const defaultMcqQt = await db.questionType.findFirst({
        where: {
          OR: [
            { label: { contains: "MCQ", mode: "insensitive" } },
            { nameEn: { contains: "MCQ", mode: "insensitive" } },
          ],
          isActive: true,
        },
        select: { id: true },
      })
      if (defaultMcqQt) {
        resolvedQuestionTypeId = defaultMcqQt.id
      }
    }
  }

  return db.mcq.create({
    data: {
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      question: data.question,
      answer: data.answer,
      options: data.options,
      statements: data.statements,
      type: data.type,
      isMath: data.isMath,
      reference: data.reference,
      explanation: data.explanation,
      questionUrl: data.questionUrl,
      contextId: data.contextId,
      difficulty: data.difficulty,
      year: data.year,
      source: data.source,
      questionTypeId: resolvedQuestionTypeId || undefined,
      isActive: data.isActive,
      attachments: allAttachments.length > 0 ? {
        create: allAttachments.map((att) => ({
          url: att.url,
          type: att.type ?? "image",
          caption: att.caption ?? null,
          position: att.position ?? 0,
        })),
      } : undefined,
    } as any,
  })
}

export async function updateMcq(db: PrismaClient, input: UpdateMcqInput) {
  const { id, attachments, context, ...data } = input
  
  // Verify existence
  await getMcqById(db, { id })

  const allAttachments = Array.isArray(attachments) ? [...attachments] : []
  if (context && context.trim()) {
    allAttachments.push({
      url: "text-context",
      type: "text",
      caption: context.trim(),
      position: 99,
    })
  }

  let resolvedQuestionTypeId = data.questionTypeId
  if (!resolvedQuestionTypeId) {
    const qt = await db.questionType.findFirst({
      where: {
        OR: [
          { label: { contains: "MCQ", mode: "insensitive" } },
          { nameEn: { contains: "MCQ", mode: "insensitive" } },
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
      const defaultMcqQt = await db.questionType.findFirst({
        where: {
          OR: [
            { label: { contains: "MCQ", mode: "insensitive" } },
            { nameEn: { contains: "MCQ", mode: "insensitive" } },
          ],
          isActive: true,
        },
        select: { id: true },
      })
      if (defaultMcqQt) {
        resolvedQuestionTypeId = defaultMcqQt.id
      }
    }
  }

  return db.mcq.update({
    where: { id },
    data: {
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      question: data.question,
      answer: data.answer,
      options: data.options,
      statements: data.statements,
      type: data.type,
      isMath: data.isMath,
      reference: data.reference,
      explanation: data.explanation,
      questionUrl: data.questionUrl,
      contextId: data.contextId,
      difficulty: data.difficulty,
      year: data.year,
      source: data.source,
      questionTypeId: resolvedQuestionTypeId || undefined,
      isActive: data.isActive,
      attachments: allAttachments ? {
        deleteMany: {},
        create: allAttachments.map((att) => ({
          url: att.url,
          type: att.type ?? "image",
          caption: att.caption ?? null,
          position: att.position ?? 0,
        })),
      } : undefined,
    } as any,
  })
}

export async function deleteMcq(db: PrismaClient, input: DeleteMcqInput) {
  await getMcqById(db, { id: input.id })

  return db.mcq.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteMcqs(db: PrismaClient, input: BulkDeleteMcqsInput) {
  const res = await db.mcq.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function toggleMcqActive(db: PrismaClient, input: ToggleMcqActiveInput) {
  await getMcqById(db, { id: input.id })

  return db.mcq.update({
    where: { id: input.id },
    data: { isActive: input.isActive },
  })
}

export async function importMcqs(db: PrismaClient, input: ImportMcqsInput) {
  // Query for the default MCQ question type once to avoid querying inside the transaction loop if possible
  const defaultMcqQt = await db.questionType.findFirst({
    where: {
      OR: [
        { label: { contains: "MCQ", mode: "insensitive" } },
        { nameEn: { contains: "MCQ", mode: "insensitive" } },
      ],
      isActive: true,
    },
    select: { id: true },
  })

  const subjectQtCache: Record<string, string> = {}

  // Use transaction to support nested attachments with a timeout limit
  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const mcq of input.mcqs) {
        const { attachments, context, ...data } = mcq
        const allAttachments = Array.isArray(attachments) ? [...attachments] : []
        if (context && context.trim()) {
          allAttachments.push({
            url: "text-context",
            type: "text",
            caption: context.trim(),
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
                  { label: { contains: "MCQ", mode: "insensitive" } },
                  { nameEn: { contains: "MCQ", mode: "insensitive" } },
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
            } else if (defaultMcqQt) {
              resolvedQuestionTypeId = defaultMcqQt.id
            }
          }
        }

        const createdMcq = await tx.mcq.create({
          data: {
            subjectId: data.subjectId,
            chapterId: data.chapterId,
            question: data.question,
            answer: data.answer,
            options: data.options,
            statements: data.statements || [],
            type: data.type,
            isMath: data.isMath ?? false,
            reference: data.reference || [],
            explanation: data.explanation,
            questionUrl: data.questionUrl,
            contextId: data.contextId,
            difficulty: data.difficulty ?? "MEDIUM",
            year: data.year,
            source: data.source,
            questionTypeId: resolvedQuestionTypeId || undefined,
            isActive: data.isActive ?? true,
            attachments: allAttachments.length > 0 ? {
              create: allAttachments.map((att) => ({
                url: att.url,
                type: att.type ?? "image",
                caption: att.caption ?? null,
                position: att.position ?? 0,
              })),
            } : undefined,
          } as any,
        })
        results.push(createdMcq)
      }
      return results
    },
    {
      timeout: 30000, // 30 seconds maximum transaction timeout
    }
  )
  return { importedCount: created.length }
}

export async function getMcqStats(db: PrismaClient, input: McqStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId

  const [totalCount, activeCount, inactiveCount, mathCount, typeGroups] = await Promise.all([
    db.mcq.count({ where }),
    db.mcq.count({ where: { ...where, isActive: true } }),
    db.mcq.count({ where: { ...where, isActive: false } }),
    db.mcq.count({ where: { ...where, isMath: true } }),
    db.mcq.groupBy({
      by: ["type"],
      where,
      _count: { id: true },
    }),
  ])

  const typeCounts = {
    SINGLE: 0,
    MULTIPLE: 0,
    COMBINED: 0,
  }

  for (const group of typeGroups) {
    if (group.type in typeCounts) {
      typeCounts[group.type as keyof typeof typeCounts] = group._count.id
    }
  }

  return {
    totalCount,
    activeCount,
    inactiveCount,
    mathCount,
    typeCounts,
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

  const groups = await db.mcq.groupBy({
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
