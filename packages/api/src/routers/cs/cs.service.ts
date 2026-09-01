import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateCsInput,
  DeleteCsInput,
  GetCsInput,
  ListCsInput,
  UpdateCsInput,
  BulkDeleteCsInput,
  ToggleCsActiveInput,
  ImportCsInput,
  CsStatsInput,
} from "./cs.schema"

export async function listCs(db: PrismaClient, input: ListCsInput) {
  const where: any = {}

  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId
  if (input.difficulty) where.difficulty = input.difficulty

  if (input.query) {
    where.OR = [
      { questionA: { contains: input.query, mode: "insensitive" } },
      { questionB: { contains: input.query, mode: "insensitive" } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (input.sort === "newest") {
    orderBy = { createdAt: "desc" }
  } else if (input.sort === "oldest") {
    orderBy = { createdAt: "asc" }
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = (page - 1) * limit

  const [items, totalItems] = await Promise.all([
    (db as any).cS.findMany({
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
      },
    }),
    (db as any).cS.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
  }
}

export async function getCsById(db: PrismaClient, input: GetCsInput) {
  const cs = await (db as any).cS.findUnique({
    where: { id: input.id },
    include: {
      subject: {
        include: {
          classSubjects: true,
        },
      },
      chapter: true,
      questionType: true,
    },
  })

  if (!cs) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `CS with ID ${input.id} not found`,
    })
  }

  return cs
}

export async function createCs(db: PrismaClient, input: CreateCsInput) {
  const { ...data } = input

  let resolvedQuestionTypeId = data.questionTypeId
  if (!resolvedQuestionTypeId) {
    const qt = await db.questionType.findFirst({
      where: {
        OR: [
          { label: { contains: "CS", mode: "insensitive" } },
          { nameEn: { contains: "CS", mode: "insensitive" } },
          { label: { contains: "Creative Short", mode: "insensitive" } },
          { nameEn: { contains: "Creative Short", mode: "insensitive" } },
          { label: { contains: "Creative Scenario", mode: "insensitive" } },
          { nameEn: { contains: "Creative Scenario", mode: "insensitive" } },
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
      const defaultCsQt = await db.questionType.findFirst({
        where: {
          OR: [
            { label: { contains: "CS", mode: "insensitive" } },
            { nameEn: { contains: "CS", mode: "insensitive" } },
            { label: { contains: "Creative Short", mode: "insensitive" } },
            { nameEn: { contains: "Creative Short", mode: "insensitive" } },
            { label: { contains: "Creative Scenario", mode: "insensitive" } },
            { nameEn: { contains: "Creative Scenario", mode: "insensitive" } },
          ],
          isActive: true,
        },
        select: { id: true },
      })
      if (defaultCsQt) {
        resolvedQuestionTypeId = defaultCsQt.id
      }
    }
  }

  return (db as any).cS.create({
    data: {
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      questionA: data.questionA,
      questionB: data.questionB,
      reference: data.reference ?? [],
      difficulty: data.difficulty,
      questionTypeId: resolvedQuestionTypeId || undefined,
      isActive: data.isActive,
    },
  })
}

export async function updateCs(db: PrismaClient, input: UpdateCsInput) {
  const { id, ...data } = input

  // Verify existence
  await getCsById(db, { id })

  let resolvedQuestionTypeId = data.questionTypeId
  if (!resolvedQuestionTypeId && data.subjectId) {
    const qt = await db.questionType.findFirst({
      where: {
        OR: [
          { label: { contains: "CS", mode: "insensitive" } },
          { nameEn: { contains: "CS", mode: "insensitive" } },
          { label: { contains: "Creative Short", mode: "insensitive" } },
          { nameEn: { contains: "Creative Short", mode: "insensitive" } },
          { label: { contains: "Creative Scenario", mode: "insensitive" } },
          { nameEn: { contains: "Creative Scenario", mode: "insensitive" } },
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

  return (db as any).cS.update({
    where: { id },
    data: {
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      questionA: data.questionA,
      questionB: data.questionB,
      reference: data.reference,
      difficulty: data.difficulty,
      questionTypeId: resolvedQuestionTypeId || undefined,
      isActive: data.isActive,
    },
  })
}

export async function deleteCs(db: PrismaClient, input: DeleteCsInput) {
  await getCsById(db, { id: input.id })

  return (db as any).cS.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteCs(db: PrismaClient, input: BulkDeleteCsInput) {
  const res = await (db as any).cS.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function toggleCsActive(db: PrismaClient, input: ToggleCsActiveInput) {
  await getCsById(db, { id: input.id })

  return (db as any).cS.update({
    where: { id: input.id },
    data: { isActive: input.isActive },
  })
}

export async function importCs(db: PrismaClient, input: ImportCsInput) {
  const defaultCsQt = await db.questionType.findFirst({
    where: {
      OR: [
        { label: { contains: "CS", mode: "insensitive" } },
        { nameEn: { contains: "CS", mode: "insensitive" } },
        { label: { contains: "Creative Short", mode: "insensitive" } },
        { nameEn: { contains: "Creative Short", mode: "insensitive" } },
        { label: { contains: "Creative Scenario", mode: "insensitive" } },
        { nameEn: { contains: "Creative Scenario", mode: "insensitive" } },
      ],
      isActive: true,
    },
    select: { id: true },
  })

  const subjectQtCache: Record<string, string> = {}

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const cs of input.cses) {
        const { ...data } = cs

        let resolvedQuestionTypeId = data.questionTypeId
        if (!resolvedQuestionTypeId) {
          const subId = data.subjectId
          if (subjectQtCache[subId]) {
            resolvedQuestionTypeId = subjectQtCache[subId]
          } else {
            const qt = await tx.questionType.findFirst({
              where: {
                OR: [
                  { label: { contains: "CS", mode: "insensitive" } },
                  { nameEn: { contains: "CS", mode: "insensitive" } },
                  { label: { contains: "Creative Short", mode: "insensitive" } },
                  { nameEn: { contains: "Creative Short", mode: "insensitive" } },
                  { label: { contains: "Creative Scenario", mode: "insensitive" } },
                  { nameEn: { contains: "Creative Scenario", mode: "insensitive" } },
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
            } else if (defaultCsQt) {
              resolvedQuestionTypeId = defaultCsQt.id
            }
          }
        }

        const createdCs = await (tx as any).cS.create({
          data: {
            subjectId: data.subjectId,
            chapterId: data.chapterId,
            questionA: data.questionA,
            questionB: data.questionB,
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            questionTypeId: resolvedQuestionTypeId || undefined,
            isActive: data.isActive ?? true,
          },
        })
        results.push(createdCs)
      }
      return results
    },
    {
      timeout: 30000,
    }
  )

  return { importedCount: created.length }
}

export async function getCsStats(db: PrismaClient, input: CsStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId

  const [totalCount, activeCount, inactiveCount, easyCount, mediumCount, hardCount] = await Promise.all([
    (db as any).cS.count({ where }),
    (db as any).cS.count({ where: { ...where, isActive: true } }),
    (db as any).cS.count({ where: { ...where, isActive: false } }),
    (db as any).cS.count({ where: { ...where, difficulty: "EASY" } }),
    (db as any).cS.count({ where: { ...where, difficulty: "MEDIUM" } }),
    (db as any).cS.count({ where: { ...where, difficulty: "HARD" } }),
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
