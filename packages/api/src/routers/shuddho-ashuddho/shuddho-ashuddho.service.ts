import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateShuddhoAshuddhoInput,
  DeleteShuddhoAshuddhoInput,
  GetShuddhoAshuddhoInput,
  ListShuddhoAshuddhoInput,
  UpdateShuddhoAshuddhoInput,
  BulkDeleteShuddhoAshuddhoInput,
  ImportShuddhoAshuddhoInput,
  ShuddhoAshuddhoStatsInput,
} from "./shuddho-ashuddho.schema"

async function resolveShuddhoAshuddhoQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Shuddho Ashuddho", mode: "insensitive" } },
        { label: { equals: "Shuddho Ashuddho", mode: "insensitive" } },
        { nameEn: { equals: "SHUDDHO_ASHUDDHO", mode: "insensitive" } },
        { nameBn: { equals: "শুদ্ধ অশুদ্ধ", mode: "insensitive" } },
        { nameBn: { contains: "শুদ্ধ অশুদ্ধ" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Shuddho Ashuddho",
        nameBn: "শুদ্ধ অশুদ্ধ",
        label: "Shuddho Ashuddho",
        mark: 5,
        position: 23,
        descriptionEn: "Identify Shuddho / Ashuddho sentences",
        descriptionBn: "নিচের বাক্যগুলো হতে শুদ্ধ অশুদ্ধ নির্ণয় করো",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listShuddhoAshuddho(db: PrismaClient, input: ListShuddhoAshuddhoInput) {
  const { page, limit, query, subjectId, chapterId, academicChapterId, difficulty, source, session, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}
  const targetChapterId = academicChapterId || chapterId

  if (subjectId) where.subjectId = subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId
  if (difficulty) where.difficulty = difficulty
  if (source) where.source = source
  if (session) where.session = session

  if (query) {
    where.OR = [
      { sentence: { contains: query, mode: "insensitive" } },
      { answer: { contains: query, mode: "insensitive" } },
      { source: { contains: query, mode: "insensitive" } },
      { session: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "newest" || sort === "createdAt_desc") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "oldest" || sort === "createdAt_asc") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "sentence_asc") {
    orderBy = { sentence: "asc" }
  } else if (sort === "sentence_desc") {
    orderBy = { sentence: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.shuddhoAshuddho.findMany({
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
    db.shuddhoAshuddho.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getShuddhoAshuddhoById(db: PrismaClient, input: GetShuddhoAshuddhoInput) {
  const item = await db.shuddhoAshuddho.findUnique({
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
      message: `Shuddho Ashuddho entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createShuddhoAshuddho(
  db: PrismaClient,
  input: CreateShuddhoAshuddhoInput,
  userId?: string | null
) {
  const data = input
  const resolvedQuestionTypeId = await resolveShuddhoAshuddhoQuestionTypeId(db)
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  return db.shuddhoAshuddho.create({
    data: {
      sentence: data.sentence,
      answer: data.answer || null,
      reference: data.reference ?? [],
      source: data.source ? data.source.trim() : "গাইড বুক",
      session: data.session ? data.session.trim() : currentYear,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      subjectId: data.subjectId,
      academicChapterId: targetChapterId,
      questionTypeId: resolvedQuestionTypeId,
      ...(userId ? { createdById: userId } : {}),
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function updateShuddhoAshuddho(
  db: PrismaClient,
  input: UpdateShuddhoAshuddhoInput,
  userId?: string | null
) {
  const { id, ...data } = input

  await getShuddhoAshuddhoById(db, { id })
  const resolvedQuestionTypeId = await resolveShuddhoAshuddhoQuestionTypeId(db)
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    sentence: data.sentence,
    answer: data.answer !== undefined ? data.answer : undefined,
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

  return db.shuddhoAshuddho.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function deleteShuddhoAshuddho(db: PrismaClient, input: DeleteShuddhoAshuddhoInput) {
  await getShuddhoAshuddhoById(db, { id: input.id })

  return db.shuddhoAshuddho.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteShuddhoAshuddho(db: PrismaClient, input: BulkDeleteShuddhoAshuddhoInput) {
  const res = await db.shuddhoAshuddho.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importShuddhoAshuddho(
  db: PrismaClient,
  input: ImportShuddhoAshuddhoInput,
  userId?: string | null
) {
  const resolvedQuestionTypeId = await resolveShuddhoAshuddhoQuestionTypeId(db)
  const currentYear = new Date().getFullYear().toString()

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.shuddhoAshuddho.create({
          data: {
            sentence: data.sentence,
            answer: data.answer || null,
            reference: data.reference || [],
            source: data.source ? data.source.trim() : "গাইড বুক",
            session: currentYear,
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            academicChapterId: targetChapterId,
            questionTypeId: resolvedQuestionTypeId,
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

export async function getShuddhoAshuddhoStats(db: PrismaClient, input: ShuddhoAshuddhoStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.shuddhoAshuddho.count({ where }),
    db.shuddhoAshuddho.count({ where: { ...where, difficulty: "EASY" } }),
    db.shuddhoAshuddho.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.shuddhoAshuddho.count({ where: { ...where, difficulty: "HARD" } }),
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
