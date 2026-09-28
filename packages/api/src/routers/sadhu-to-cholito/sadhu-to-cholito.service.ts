import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateSadhuToCholitoInput,
  DeleteSadhuToCholitoInput,
  GetSadhuToCholitoInput,
  ListSadhuToCholitoInput,
  UpdateSadhuToCholitoInput,
  BulkDeleteSadhuToCholitoInput,
  ImportSadhuToCholitoInput,
  SadhuToCholitoStatsInput,
} from "./sadhu-to-cholito.schema"

async function resolveSadhuToCholitoQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Sadhu to Cholito", mode: "insensitive" } },
        { label: { equals: "Sadhu to Cholito", mode: "insensitive" } },
        { nameEn: { equals: "SADHU_TO_CHOLITO", mode: "insensitive" } },
        { nameBn: { equals: "সাধুরীতি থেকে চলিত রীতি", mode: "insensitive" } },
        { nameBn: { contains: "সাধুরীতি" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Sadhu to Cholito",
        nameBn: "সাধুরীতি থেকে চলিত রীতি",
        label: "Sadhu to Cholito",
        mark: 5,
        position: 26,
        descriptionEn: "Sadhu to Cholito",
        descriptionBn: "সাধুরীতি থেকে চলিত রীতি",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listSadhuToCholito(db: PrismaClient, input: ListSadhuToCholitoInput) {
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
      { sadhuText: { contains: query, mode: "insensitive" } },
      { cholitoText: { contains: query, mode: "insensitive" } },
      { alternativeTexts: { has: query } },
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
  } else if (sort === "sadhuText_asc" || sort === "word_asc") {
    orderBy = { sadhuText: "asc" }
  } else if (sort === "sadhuText_desc" || sort === "word_desc") {
    orderBy = { sadhuText: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.sadhuToCholito.findMany({
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
    db.sadhuToCholito.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getSadhuToCholitoById(db: PrismaClient, input: GetSadhuToCholitoInput) {
  const item = await db.sadhuToCholito.findUnique({
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
      message: `Sadhu to Cholito entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createSadhuToCholito(db: PrismaClient, input: CreateSadhuToCholitoInput, userId?: string | null) {
  const data = input
  const resolvedQuestionTypeId = await resolveSadhuToCholitoQuestionTypeId(db)
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  return db.sadhuToCholito.create({
    data: {
      sadhuText: data.sadhuText,
      cholitoText: data.cholitoText || null,
      alternativeTexts: data.alternativeTexts ?? [],
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

export async function updateSadhuToCholito(db: PrismaClient, input: UpdateSadhuToCholitoInput, userId?: string | null) {
  const { id, ...data } = input

  await getSadhuToCholitoById(db, { id })
  const resolvedQuestionTypeId = await resolveSadhuToCholitoQuestionTypeId(db)
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    sadhuText: data.sadhuText,
    cholitoText: data.cholitoText !== undefined ? data.cholitoText : undefined,
    alternativeTexts: data.alternativeTexts,
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

  return db.sadhuToCholito.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function deleteSadhuToCholito(db: PrismaClient, input: DeleteSadhuToCholitoInput) {
  await getSadhuToCholitoById(db, { id: input.id })

  return db.sadhuToCholito.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteSadhuToCholito(db: PrismaClient, input: BulkDeleteSadhuToCholitoInput) {
  const res = await db.sadhuToCholito.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importSadhuToCholito(db: PrismaClient, input: ImportSadhuToCholitoInput, userId?: string | null) {
  const resolvedQuestionTypeId = await resolveSadhuToCholitoQuestionTypeId(db)
  const currentYear = new Date().getFullYear().toString()

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.sadhuToCholito.create({
          data: {
            sadhuText: data.sadhuText,
            cholitoText: data.cholitoText || null,
            alternativeTexts: data.alternativeTexts || [],
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

export async function getSadhuToCholitoStats(db: PrismaClient, input: SadhuToCholitoStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.sadhuToCholito.count({ where }),
    db.sadhuToCholito.count({ where: { ...where, difficulty: "EASY" } }),
    db.sadhuToCholito.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.sadhuToCholito.count({ where: { ...where, difficulty: "HARD" } }),
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
