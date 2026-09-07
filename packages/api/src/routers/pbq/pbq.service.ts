import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreatePbqInput,
  DeletePbqInput,
  GetPbqInput,
  ListPbqsInput,
  UpdatePbqInput,
  BulkDeletePbqsInput,
  TogglePbqActiveInput,
  ImportPbqsInput,
  PbqStatsInput,
} from "./pbq.schema"

export async function listPbqs(
  db: PrismaClient,
  input: ListPbqsInput,
  ctx?: { session?: { user?: { id?: string } } | null; tenantId?: string }
) {
  const where: any = {
    deletedAt: null,
  }

  if (input.subjectId) where.subjectId = input.subjectId

  const chapterId = input.academicChapterId || input.chapterId
  if (chapterId) where.academicChapterId = chapterId

  if (input.difficulty) where.difficulty = input.difficulty

  if (input.board) {
    where.reference = { has: input.board }
  }

  if (input.query) {
    where.OR = [
      { questionA: { contains: input.query, mode: "insensitive" } },
      { questionB: { contains: input.query, mode: "insensitive" } },
      { questionC: { contains: input.query, mode: "insensitive" } },
      { questionD: { contains: input.query, mode: "insensitive" } },
      { questionE: { contains: input.query, mode: "insensitive" } },
      { context: { contains: input.query, mode: "insensitive" } },
      { reference: { has: input.query } },
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
    db.pBQ.findMany({
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
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    db.pBQ.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
  }
}

export async function getPbqById(db: PrismaClient, input: GetPbqInput) {
  const pbq = await db.pBQ.findFirst({
    where: {
      id: input.id,
      deletedAt: null,
    },
    include: {
      subject: {
        include: {
          classSubjects: true,
        },
      },
      academicChapter: true,
      questionType: true,
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

  if (!pbq) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `PBQ with ID ${input.id} not found`,
    })
  }

  return pbq
}

export async function createPbq(
  db: PrismaClient,
  input: CreatePbqInput,
  ctx?: { session?: { user?: { id?: string } } | null; tenantId?: string }
) {
  const chapterId = input.academicChapterId || input.chapterId || null
  const userId = ctx?.session?.user?.id || null

  let resolvedQuestionTypeId = input.questionTypeId
  if (!resolvedQuestionTypeId) {
    const qt = await db.questionType.findFirst({
      where: {
        OR: [
          { label: { contains: "PBQ", mode: "insensitive" } },
          { nameEn: { contains: "Passage", mode: "insensitive" } },
          { nameBn: { contains: "অনুচ্ছেদভিত্তিক", mode: "insensitive" } },
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

  const marksDistribution = input.marks || { a: 2, b: 2, c: 2, d: 2, e: 2 }

  return db.pBQ.create({
    data: {
      subjectId: input.subjectId,
      academicChapterId: chapterId,
      questionTypeId: resolvedQuestionTypeId,
      context: input.context,
      questionA: input.questionA,
      questionB: input.questionB,
      questionC: input.questionC,
      questionD: input.questionD,
      questionE: input.questionE,
      reference: input.reference || [],
      difficulty: input.difficulty ?? "MEDIUM",
      marks: marksDistribution,
      isActive: input.isActive ?? true,
      createdById: userId,
      updatedById: userId,
      tenantId: ctx?.tenantId || null,
      isGlobal: !ctx?.tenantId,
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function updatePbq(
  db: PrismaClient,
  input: UpdatePbqInput,
  ctx?: { session?: { user?: { id?: string } } | null }
) {
  const { id, ...data } = input
  await getPbqById(db, { id })

  const chapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const userId = ctx?.session?.user?.id || null

  return db.pBQ.update({
    where: { id },
    data: {
      subjectId: data.subjectId,
      academicChapterId: chapterId !== undefined ? chapterId : undefined,
      questionTypeId: data.questionTypeId || undefined,
      context: data.context,
      questionA: data.questionA,
      questionB: data.questionB,
      questionC: data.questionC,
      questionD: data.questionD,
      questionE: data.questionE,
      reference: data.reference,
      difficulty: data.difficulty,
      marks: data.marks !== undefined ? (data.marks as any) : undefined,
      isActive: data.isActive,
      updatedById: userId || undefined,
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function deletePbq(
  db: PrismaClient,
  input: DeletePbqInput,
  ctx?: { session?: { user?: { id?: string } } | null }
) {
  await getPbqById(db, { id: input.id })
  const userId = ctx?.session?.user?.id || null

  return db.pBQ.update({
    where: { id: input.id },
    data: {
      deletedAt: new Date(),
      isActive: false,
      updatedById: userId || undefined,
    },
  })
}

export async function bulkDeletePbqs(
  db: PrismaClient,
  input: BulkDeletePbqsInput,
  ctx?: { session?: { user?: { id?: string } } | null }
) {
  const userId = ctx?.session?.user?.id || null
  const res = await db.pBQ.updateMany({
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

export async function togglePbqActive(
  db: PrismaClient,
  input: TogglePbqActiveInput,
  ctx?: { session?: { user?: { id?: string } } | null }
) {
  await getPbqById(db, { id: input.id })
  const userId = ctx?.session?.user?.id || null

  return db.pBQ.update({
    where: { id: input.id },
    data: {
      isActive: input.isActive,
      updatedById: userId || undefined,
    },
  })
}

export async function importPbqs(
  db: PrismaClient,
  input: ImportPbqsInput,
  ctx?: { session?: { user?: { id?: string } } | null; tenantId?: string }
) {
  const userId = ctx?.session?.user?.id || null

  let defaultPbqQt = await db.questionType.findFirst({
    where: {
      OR: [
        { label: { contains: "PBQ", mode: "insensitive" } },
        { nameEn: { contains: "Passage", mode: "insensitive" } },
        { nameBn: { contains: "অনুচ্ছেদভিত্তিক", mode: "insensitive" } },
      ],
      isActive: true,
    },
    select: { id: true },
  })
  if (!defaultPbqQt) {
    defaultPbqQt = await db.questionType.findFirst({ select: { id: true } })
  }

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const pbq of input.pbqs) {
        const chapterId = pbq.academicChapterId || pbq.chapterId || null
        const resolvedQuestionTypeId = pbq.questionTypeId || defaultPbqQt?.id || ""

        const marksDistribution = pbq.marks || { a: 2, b: 2, c: 2, d: 2, e: 2 }

        const createdPbq = await tx.pBQ.create({
          data: {
            subjectId: pbq.subjectId,
            academicChapterId: chapterId,
            questionTypeId: resolvedQuestionTypeId,
            context: pbq.context,
            questionA: pbq.questionA,
            questionB: pbq.questionB,
            questionC: pbq.questionC,
            questionD: pbq.questionD,
            questionE: pbq.questionE,
            reference: pbq.reference || [],
            difficulty: pbq.difficulty ?? "MEDIUM",
            marks: marksDistribution,
            isActive: pbq.isActive ?? true,
            createdById: userId,
            updatedById: userId,
            tenantId: ctx?.tenantId || null,
            isGlobal: !ctx?.tenantId,
          },
        })
        results.push(createdPbq)
      }
      return results
    },
    { timeout: 30000 }
  )

  return { importedCount: created.length }
}

export async function getPbqStats(db: PrismaClient, input: PbqStatsInput = {}) {
  const where: any = { deletedAt: null }
  if (input.subjectId) where.subjectId = input.subjectId
  const chapterId = input.academicChapterId || input.chapterId
  if (chapterId) where.academicChapterId = chapterId

  const [totalCount, activeCount, inactiveCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.pBQ.count({ where }),
    db.pBQ.count({ where: { ...where, isActive: true } }),
    db.pBQ.count({ where: { ...where, isActive: false } }),
    db.pBQ.count({ where: { ...where, difficulty: "EASY" } }),
    db.pBQ.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.pBQ.count({ where: { ...where, difficulty: "HARD" } }),
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
    deletedAt: null,
    NOT: { reference: { equals: [] } },
  }
  const chapterId = input.academicChapterId || input.chapterId
  if (chapterId) where.academicChapterId = chapterId

  const questions = await db.pBQ.findMany({
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
