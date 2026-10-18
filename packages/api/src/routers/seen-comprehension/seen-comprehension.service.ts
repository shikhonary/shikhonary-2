import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateSeenComprehensionInput,
  DeleteSeenComprehensionInput,
  GetSeenComprehensionInput,
  ListSeenComprehensionsInput,
  UpdateSeenComprehensionInput,
  BulkDeleteSeenComprehensionsInput,
  ToggleSeenComprehensionActiveInput,
  ImportSeenComprehensionsInput,
  SeenComprehensionStatsInput,
} from "./seen-comprehension.schema"

export async function listSeenComprehensions(
  db: PrismaClient,
  input: ListSeenComprehensionsInput,
  ctx?: { session?: { user?: { id?: string } } | null; tenantId?: string }
) {
  const where: any = {
    deletedAt: null,
  }

  if (input.subjectId) where.subjectId = input.subjectId

  const chapterId = input.academicChapterId || input.chapterId
  if (chapterId) where.academicChapterId = chapterId

  if (input.comprehensionType) where.comprehensionType = input.comprehensionType
  if (input.difficulty) where.difficulty = input.difficulty
  if (input.isActive !== undefined) where.isActive = input.isActive

  if (input.board) {
    where.reference = { has: input.board }
  }

  if (input.query) {
    where.OR = [
      { title: { contains: input.query, mode: "insensitive" } },
      { passage: { contains: input.query, mode: "insensitive" } },
      { instruction: { contains: input.query, mode: "insensitive" } },
      { source: { contains: input.query, mode: "insensitive" } },
      { reference: { has: input.query } },
      {
        questions: {
          some: {
            question: { contains: input.query, mode: "insensitive" },
          },
        },
      },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (input.sort === "newest") {
    orderBy = { createdAt: "desc" }
  } else if (input.sort === "oldest") {
    orderBy = { createdAt: "asc" }
  } else if (input.sort === "title_asc") {
    orderBy = { title: "asc" }
  } else if (input.sort === "title_desc") {
    orderBy = { title: "desc" }
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = (page - 1) * limit

  const [items, totalItems] = await Promise.all([
    db.seenComprehension.findMany({
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
        academicChapter: {
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
        questions: {
          orderBy: [
            { groupNumber: "asc" },
            { orderIndex: "asc" },
          ],
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        updater: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    db.seenComprehension.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    page,
    limit,
  }
}

export async function getSeenComprehensionStats(
  db: PrismaClient,
  input: SeenComprehensionStatsInput
) {
  const where: any = {
    deletedAt: null,
  }

  if (input.subjectId) where.subjectId = input.subjectId
  const chapterId = input.academicChapterId || input.chapterId
  if (chapterId) where.academicChapterId = chapterId
  if (input.comprehensionType) where.comprehensionType = input.comprehensionType

  const [total, active, easy, medium, hard, seen1, seen2] = await Promise.all([
    db.seenComprehension.count({ where }),
    db.seenComprehension.count({ where: { ...where, isActive: true } }),
    db.seenComprehension.count({ where: { ...where, difficulty: "EASY" } }),
    db.seenComprehension.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.seenComprehension.count({ where: { ...where, difficulty: "HARD" } }),
    db.seenComprehension.count({ where: { ...where, comprehensionType: "SEEN_COMPREHENSION_1" } }),
    db.seenComprehension.count({ where: { ...where, comprehensionType: "SEEN_COMPREHENSION_2" } }),
  ])

  return {
    total,
    active,
    inactive: total - active,
    byDifficulty: {
      easy,
      medium,
      hard,
    },
    byType: {
      seen1,
      seen2,
    },
  }
}

export async function getSeenComprehensionById(
  db: PrismaClient,
  input: GetSeenComprehensionInput
) {
  const item = await db.seenComprehension.findFirst({
    where: {
      id: input.id,
      deletedAt: null,
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
      questions: {
        orderBy: [
          { groupNumber: "asc" },
          { orderIndex: "asc" },
        ],
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      updater: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  if (!item) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Seen Comprehension with ID ${input.id} not found`,
    })
  }

  return item
}

export async function getBoardYears(
  db: PrismaClient,
  input: { subjectId: string; chapterId?: string; academicChapterId?: string; comprehensionType?: string }
) {
  const where: any = {
    subjectId: input.subjectId,
    deletedAt: null,
  }

  const chapterId = input.academicChapterId || input.chapterId
  if (chapterId) where.academicChapterId = chapterId
  if (input.comprehensionType) where.comprehensionType = input.comprehensionType

  const records = await db.seenComprehension.findMany({
    where,
    select: { reference: true },
  })

  const uniqueRefs = new Set<string>()
  for (const r of records) {
    if (Array.isArray(r.reference)) {
      for (const ref of r.reference) {
        if (ref && typeof ref === "string" && ref.trim()) {
          uniqueRefs.add(ref.trim())
        }
      }
    }
  }

  return Array.from(uniqueRefs).sort()
}

export async function createSeenComprehension(
  db: PrismaClient,
  input: CreateSeenComprehensionInput,
  ctx?: { session?: { user?: { id?: string } } | null; tenantId?: string }
) {
  const chapterId = input.academicChapterId || input.chapterId || null
  const userId = ctx?.session?.user?.id || null

  let resolvedQuestionTypeId = input.questionTypeId
  if (!resolvedQuestionTypeId) {
    const isType2 = input.comprehensionType === "SEEN_COMPREHENSION_2"
    const qt = await db.questionType.findFirst({
      where: {
        OR: isType2
          ? [
              { label: { contains: "SEEN_COMPREHENSION_2", mode: "insensitive" } },
              { nameEn: { contains: "Seen Comprehension 2", mode: "insensitive" } },
              { nameBn: { contains: "সীন কম্প্রিহেনশন ২", mode: "insensitive" } },
            ]
          : [
              { label: { contains: "SEEN_COMPREHENSION_1", mode: "insensitive" } },
              { nameEn: { contains: "Seen Comprehension 1", mode: "insensitive" } },
              { nameBn: { contains: "সীন কম্প্রিহেনশন ১", mode: "insensitive" } },
              { nameEn: { contains: "Seen Comprehension", mode: "insensitive" } },
            ],
        isActive: true,
      },
      select: { id: true },
    })

    if (qt) {
      resolvedQuestionTypeId = qt.id
    } else {
      const fallbackQt = await db.questionType.findFirst({ select: { id: true } })
      resolvedQuestionTypeId = fallbackQt?.id || ""
    }
  }

  const subQuestions = input.questions || []
  const computedMarks = input.totalMarks ?? (
    subQuestions.length > 0
      ? subQuestions.reduce((acc, q) => acc + (Number(q.marks) || 0), 0)
      : (input.comprehensionType === "SEEN_COMPREHENSION_2" ? 10 : 15)
  )

  return db.seenComprehension.create({
    data: {
      subjectId: input.subjectId,
      academicChapterId: chapterId,
      questionTypeId: resolvedQuestionTypeId,
      title: input.title,
      passage: input.passage,
      instruction: input.instruction,
      source: input.source,
      reference: input.reference || [],
      session: input.session,
      comprehensionType: input.comprehensionType || "SEEN_COMPREHENSION_1",
      difficulty: input.difficulty ?? "MEDIUM",
      totalMarks: computedMarks,
      isActive: input.isActive ?? true,
      createdById: userId,
      updatedById: userId,
      tenantId: ctx?.tenantId || null,
      isGlobal: !ctx?.tenantId,
      questions: {
        create: subQuestions.map((q, idx) => ({
          groupNumber: q.groupNumber ?? 1,
          groupTitle: q.groupTitle ?? null,
          itemLabel: q.itemLabel ?? null,
          orderIndex: q.orderIndex ?? idx,
          type: q.type ?? "SHORT_ANSWER",
          question: q.question,
          options: q.options ? (typeof q.options === "string" ? q.options : JSON.stringify(q.options)) : "[]",
          answer: q.answer ?? null,
          explanation: q.explanation ?? null,
          marks: q.marks ?? 1.0,
        })),
      },
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
      questions: {
        orderBy: [
          { groupNumber: "asc" },
          { orderIndex: "asc" },
        ],
      },
    },
  })
}

export async function updateSeenComprehension(
  db: PrismaClient,
  input: UpdateSeenComprehensionInput,
  ctx?: { session?: { user?: { id?: string } } | null }
) {
  const { id, questions, ...data } = input
  await getSeenComprehensionById(db, { id })

  const chapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const userId = ctx?.session?.user?.id || null

  const subQuestions = questions !== undefined ? questions : null
  const computedMarks = data.totalMarks !== undefined 
    ? data.totalMarks 
    : (subQuestions && subQuestions.length > 0 
        ? subQuestions.reduce((acc, q) => acc + (Number(q.marks) || 0), 0)
        : undefined)

  return db.$transaction(async (tx) => {
    if (subQuestions !== null) {
      await tx.seenComprehensionQuestion.deleteMany({
        where: { seenComprehensionId: id },
      })
      if (subQuestions.length > 0) {
        await tx.seenComprehensionQuestion.createMany({
          data: subQuestions.map((q, idx) => ({
            seenComprehensionId: id,
            groupNumber: q.groupNumber ?? 1,
            groupTitle: q.groupTitle ?? null,
            itemLabel: q.itemLabel ?? null,
            orderIndex: q.orderIndex ?? idx,
            type: q.type ?? "SHORT_ANSWER",
            question: q.question,
            options: q.options ? (typeof q.options === "string" ? q.options : JSON.stringify(q.options)) : "[]",
            answer: q.answer ?? null,
            explanation: q.explanation ?? null,
            marks: q.marks ?? 1.0,
          })),
        })
      }
    }

    return tx.seenComprehension.update({
      where: { id },
      data: {
        subjectId: data.subjectId,
        academicChapterId: chapterId !== undefined ? chapterId : undefined,
        questionTypeId: data.questionTypeId || undefined,
        title: data.title,
        passage: data.passage,
        instruction: data.instruction,
        source: data.source,
        reference: data.reference,
        session: data.session,
        comprehensionType: data.comprehensionType,
        difficulty: data.difficulty,
        totalMarks: computedMarks,
        isActive: data.isActive,
        updatedById: userId,
      },
      include: {
        subject: true,
        academicChapter: true,
        questionType: true,
        questions: {
          orderBy: [
            { groupNumber: "asc" },
            { orderIndex: "asc" },
          ],
        },
      },
    })
  })
}

export async function deleteSeenComprehension(
  db: PrismaClient,
  input: DeleteSeenComprehensionInput,
  ctx?: { session?: { user?: { id?: string } } | null }
) {
  const item = await getSeenComprehensionById(db, { id: input.id })

  return db.seenComprehension.update({
    where: { id: input.id },
    data: {
      deletedAt: new Date(),
      updatedById: ctx?.session?.user?.id || null,
    },
  })
}

export async function bulkDeleteSeenComprehensions(
  db: PrismaClient,
  input: BulkDeleteSeenComprehensionsInput,
  ctx?: { session?: { user?: { id?: string } } | null }
) {
  const userId = ctx?.session?.user?.id || null
  const res = await db.seenComprehension.updateMany({
    where: {
      id: { in: input.ids },
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
      isActive: false,
      updatedById: userId || undefined,
    },
  })
  return { deletedCount: res.count }
}

export async function toggleSeenComprehensionActive(
  db: PrismaClient,
  input: ToggleSeenComprehensionActiveInput,
  ctx?: { session?: { user?: { id?: string } } | null }
) {
  await getSeenComprehensionById(db, { id: input.id })

  return db.seenComprehension.update({
    where: { id: input.id },
    data: {
      isActive: input.isActive,
      updatedById: ctx?.session?.user?.id || null,
    },
  })
}

export async function importSeenComprehensions(
  db: PrismaClient,
  input: ImportSeenComprehensionsInput,
  ctx?: { session?: { user?: { id?: string } } | null; tenantId?: string }
) {
  const results = []
  for (const item of input.items) {
    const created = await createSeenComprehension(db, item, ctx)
    results.push(created)
  }
  return {
    count: results.length,
    items: results,
  }
}
