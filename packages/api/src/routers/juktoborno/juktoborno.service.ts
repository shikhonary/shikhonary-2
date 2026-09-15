import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateJuktobornoInput,
  DeleteJuktobornoInput,
  GetJuktobornoInput,
  ListJuktobornoInput,
  UpdateJuktobornoInput,
  BulkDeleteJuktobornoInput,
  ImportJuktobornoInput,
  JuktobornoStatsInput,
} from "./juktoborno.schema"

async function resolveJuktobornoQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Juktoborno", mode: "insensitive" } },
        { label: { equals: "Juktoborno", mode: "insensitive" } },
        { nameEn: { equals: "JUKTOBORNO", mode: "insensitive" } },
        { nameBn: { equals: "যুক্তবর্ণ", mode: "insensitive" } },
        { nameBn: { contains: "যুক্তবর্ণ" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Juktoborno",
        nameBn: "যুক্তবর্ণ",
        label: "Juktoborno",
        mark: 5,
        position: 20,
        descriptionEn: "Juktoborno",
        descriptionBn: "যুক্তবর্ণ",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listJuktoborno(db: PrismaClient, input: ListJuktobornoInput) {
  const { page, limit, query, subjectId, chapterId, academicChapterId, difficulty, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}
  const targetChapterId = academicChapterId || chapterId

  if (subjectId) where.subjectId = subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId
  if (difficulty) where.difficulty = difficulty

  if (query) {
    where.OR = [
      { juktoborno: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "newest" || sort === "createdAt_desc") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "oldest" || sort === "createdAt_asc") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "juktoborno_asc") {
    orderBy = { juktoborno: "asc" }
  } else if (sort === "juktoborno_desc") {
    orderBy = { juktoborno: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.juktoborno.findMany({
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
    db.juktoborno.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getJuktobornoById(db: PrismaClient, input: GetJuktobornoInput) {
  const item = await db.juktoborno.findUnique({
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
      message: `Juktoborno entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createJuktoborno(db: PrismaClient, input: CreateJuktobornoInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveJuktobornoQuestionTypeId(db)
  const targetChapterId = data.academicChapterId || data.chapterId || null

  return db.juktoborno.create({
    data: {
      juktoborno: data.juktoborno,
      reference: data.reference ?? [],
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      subjectId: data.subjectId,
      academicChapterId: targetChapterId,
      questionTypeId: resolvedQuestionTypeId,
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function updateJuktoborno(db: PrismaClient, input: UpdateJuktobornoInput) {
  const { id, ...data } = input

  await getJuktobornoById(db, { id })
  const resolvedQuestionTypeId = await resolveJuktobornoQuestionTypeId(db)
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId

  const updateData: any = {
    juktoborno: data.juktoborno,
    reference: data.reference,
    difficulty: data.difficulty,
    popularityCount: data.popularityCount,
    subjectId: data.subjectId,
    questionTypeId: resolvedQuestionTypeId,
  }

  if (targetChapterId !== undefined) {
    updateData.academicChapterId = targetChapterId
  }

  return db.juktoborno.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function deleteJuktoborno(db: PrismaClient, input: DeleteJuktobornoInput) {
  await getJuktobornoById(db, { id: input.id })

  return db.juktoborno.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteJuktoborno(db: PrismaClient, input: BulkDeleteJuktobornoInput) {
  const res = await db.juktoborno.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importJuktoborno(db: PrismaClient, input: ImportJuktobornoInput) {
  const resolvedQuestionTypeId = await resolveJuktobornoQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.juktoborno.create({
          data: {
            juktoborno: data.juktoborno,
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            academicChapterId: targetChapterId,
            questionTypeId: resolvedQuestionTypeId,
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

export async function getJuktobornoStats(db: PrismaClient, input: JuktobornoStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.juktoborno.count({ where }),
    db.juktoborno.count({ where: { ...where, difficulty: "EASY" } }),
    db.juktoborno.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.juktoborno.count({ where: { ...where, difficulty: "HARD" } }),
  ])

  return {
    totalCount,
    difficultyCounts: {
      EASY: easyCount,
      MEDIUM: mediumCount,
      HARD: hardCount,
    },
  }
}
