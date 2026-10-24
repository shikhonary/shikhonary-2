import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateRearrangeInput,
  DeleteRearrangeInput,
  GetRearrangeInput,
  ListRearrangeInput,
  UpdateRearrangeInput,
  BulkDeleteRearrangeInput,
  ImportRearrangeInput,
  RearrangeStatsInput,
} from "./rearrange.schema"

async function resolveRearrangeQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Rearrange", mode: "insensitive" } },
        { label: { equals: "Rearrange", mode: "insensitive" } },
        { nameEn: { equals: "REARRANGE", mode: "insensitive" } },
        { nameBn: { equals: "পুনর্বিন্যাস", mode: "insensitive" } },
        { nameBn: { contains: "পুনর্বিন্যাস" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Rearrange",
        nameBn: "পুনর্বিন্যাস",
        label: "Rearrange",
        mark: 10,
        position: 25,
        descriptionEn: "Rearrange",
        descriptionBn: "পুনর্বিন্যাস",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listRearrange(db: PrismaClient, input: ListRearrangeInput) {
  const { page, limit, query, subjectId, chapterId, academicChapterId, difficulty, source, session, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}
  const targetChapterId = academicChapterId || chapterId

  if (subjectId) where.subjectId = subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId
  if (difficulty) where.difficulty = difficulty
  if (source && input.year !== undefined) {
    const boardRef = `${source}-${input.year}`
    where.OR = [
      { AND: [{ source }, { session: String(input.year) }] },
      { reference: { has: boardRef } },
    ]
  } else {
    if (source) where.source = source
    if (session) where.session = session
    if (input.year !== undefined) {
      where.reference = { has: String(input.year) }
    }
  }

  if (query) {
    const queryConditions: any[] = [
      { answerKey: { contains: query, mode: "insensitive" } },
      { options: { has: query } },
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
  if (sort === "newest" || sort === "createdAt_desc") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "oldest" || sort === "createdAt_asc") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.rearrange.findMany({
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
    db.rearrange.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getRearrangeById(db: PrismaClient, input: GetRearrangeInput) {
  const item = await db.rearrange.findUnique({
    where: { id: input.id },
    include: {
      subject: {
        include: {
          classSubjects: true,
        },
      },
      academicChapter: true,
      questionType: true,
    },
  })

  if (!item) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Rearrange entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createRearrange(db: PrismaClient, input: CreateRearrangeInput, userId?: string | null) {
  const data = input
  const resolvedQuestionTypeId = await resolveRearrangeQuestionTypeId(db)
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  return db.rearrange.create({
    data: {
      options: data.options,
      answerKey: data.answerKey || null,
      reference: data.reference ?? [],
      source: data.source ? data.source.trim() : "গাইড বুক",
      session: data.session ? data.session.trim() : currentYear,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      subjectId: data.subjectId,
      academicChapterId: targetChapterId,
      questionTypeId: resolvedQuestionTypeId,
      isActive: data.isActive !== false,
      ...(userId ? { createdById: userId } : {}),
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function updateRearrange(db: PrismaClient, input: UpdateRearrangeInput, userId?: string | null) {
  const { id, ...data } = input

  await getRearrangeById(db, { id })
  const resolvedQuestionTypeId = await resolveRearrangeQuestionTypeId(db)
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    options: data.options,
    answerKey: data.answerKey !== undefined ? data.answerKey : undefined,
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

  return db.rearrange.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function deleteRearrange(db: PrismaClient, input: DeleteRearrangeInput) {
  await getRearrangeById(db, { id: input.id })

  return db.rearrange.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteRearrange(db: PrismaClient, input: BulkDeleteRearrangeInput) {
  const res = await db.rearrange.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importRearrange(db: PrismaClient, input: ImportRearrangeInput, userId?: string | null) {
  const resolvedQuestionTypeId = await resolveRearrangeQuestionTypeId(db)
  const currentYear = new Date().getFullYear().toString()

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.rearrange.create({
          data: {
            options: data.options,
            answerKey: data.answerKey || null,
            reference: data.reference || [],
            source: data.source ? data.source.trim() : "গাইড বুক",
            session: data.session ? data.session.trim() : currentYear,
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            academicChapterId: targetChapterId,
            questionTypeId: resolvedQuestionTypeId,
            isActive: data.isActive !== false,
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

export async function getRearrangeStats(db: PrismaClient, input: RearrangeStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [totalCount, activeCount, inactiveCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.rearrange.count({ where }),
    db.rearrange.count({ where: { ...where, isActive: true } }),
    db.rearrange.count({ where: { ...where, isActive: false } }),
    db.rearrange.count({ where: { ...where, difficulty: "EASY" } }),
    db.rearrange.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.rearrange.count({ where: { ...where, difficulty: "HARD" } }),
  ])

  return {
    totalCount,
    activeCount,
    inactiveCount,
    difficultyCounts: {
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount,
      EASY: easyCount,
      MEDIUM: mediumCount,
      HARD: hardCount,
    },
  }
}

export async function getRearrangeBoardYears(
  db: PrismaClient,
  input: { subjectId?: string; chapterId?: string; academicChapterId?: string }
) {
  const targetChapterId = input.academicChapterId || input.chapterId
  const where: any = {
    OR: [
      { NOT: { reference: { equals: [] } } },
      { AND: [{ source: { not: null } }, { session: { not: null } }] },
    ],
  }

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const questions = await db.rearrange.findMany({
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
    const boardName = parts.slice(0, -1).join(" ") || parts[0]
    return {
      rawRef,
      boardName,
      year,
      count,
    }
  })
}
