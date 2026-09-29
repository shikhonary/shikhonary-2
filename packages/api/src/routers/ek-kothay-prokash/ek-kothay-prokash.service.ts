import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateEkKothayProkashInput,
  DeleteEkKothayProkashInput,
  GetEkKothayProkashInput,
  ListEkKothayProkashInput,
  UpdateEkKothayProkashInput,
  BulkDeleteEkKothayProkashInput,
  ImportEkKothayProkashInput,
  EkKothayProkashStatsInput,
} from "./ek-kothay-prokash.schema"

async function resolveEkKothayProkashQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Ek Kothay Prokash", mode: "insensitive" } },
        { label: { equals: "Ek Kothay Prokash", mode: "insensitive" } },
        { nameEn: { equals: "EK_KOTHAY_PROKASH", mode: "insensitive" } },
        { nameEn: { equals: "One Word Substitution", mode: "insensitive" } },
        { nameBn: { equals: "এক কথায় প্রকাশ", mode: "insensitive" } },
        { nameBn: { contains: "এক কথায় প্রকাশ" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Ek Kothay Prokash",
        nameBn: "এক কথায় প্রকাশ",
        label: "Ek Kothay Prokash",
        mark: 5,
        position: 25,
        descriptionEn: "One Word Substitution",
        descriptionBn: "এক কথায় প্রকাশ",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listEkKothayProkash(db: PrismaClient, input: ListEkKothayProkashInput) {
  const { page, limit, query, subjectId, chapterId, academicChapterId, wordMeaningId, difficulty, source, session, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}
  const targetChapterId = academicChapterId || chapterId

  if (subjectId) where.subjectId = subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId
  if (wordMeaningId) where.wordMeaningId = wordMeaningId
  if (difficulty) where.difficulty = difficulty
  if (source) where.source = source
  if (session) where.session = session

  if (query) {
    where.OR = [
      { phrase: { contains: query, mode: "insensitive" } },
      { oneWord: { contains: query, mode: "insensitive" } },
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
  } else if (sort === "phrase_asc") {
    orderBy = { phrase: "asc" }
  } else if (sort === "phrase_desc") {
    orderBy = { phrase: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.ekKothayProkash.findMany({
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
        wordMeaning: {
          select: {
            id: true,
            word: true,
            meaning: true,
          },
        },
      },
    }),
    db.ekKothayProkash.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getEkKothayProkashById(db: PrismaClient, input: GetEkKothayProkashInput) {
  const item = await db.ekKothayProkash.findUnique({
    where: { id: input.id },
    include: {
      subject: {
        include: {
          classSubjects: true,
        },
      },
      academicChapter: true,
      questionType: true,
      wordMeaning: true,
    },
  })

  if (!item) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Ek Kothay Prokash entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createEkKothayProkash(
  db: PrismaClient,
  input: CreateEkKothayProkashInput,
  userId?: string | null
) {
  const data = input
  const resolvedQuestionTypeId = await resolveEkKothayProkashQuestionTypeId(db)
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  return db.ekKothayProkash.create({
    data: {
      phrase: data.phrase,
      oneWord: data.oneWord || null,
      wordMeaningId: data.wordMeaningId || null,
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
      wordMeaning: true,
    },
  })
}

export async function updateEkKothayProkash(
  db: PrismaClient,
  input: UpdateEkKothayProkashInput,
  userId?: string | null
) {
  const { id, ...data } = input

  await getEkKothayProkashById(db, { id })
  const resolvedQuestionTypeId = await resolveEkKothayProkashQuestionTypeId(db)
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    phrase: data.phrase,
    oneWord: data.oneWord !== undefined ? data.oneWord : undefined,
    wordMeaningId: data.wordMeaningId !== undefined ? data.wordMeaningId : undefined,
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

  return db.ekKothayProkash.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
      wordMeaning: true,
    },
  })
}

export async function deleteEkKothayProkash(db: PrismaClient, input: DeleteEkKothayProkashInput) {
  await getEkKothayProkashById(db, { id: input.id })

  return db.ekKothayProkash.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteEkKothayProkash(db: PrismaClient, input: BulkDeleteEkKothayProkashInput) {
  const res = await db.ekKothayProkash.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importEkKothayProkash(
  db: PrismaClient,
  input: ImportEkKothayProkashInput,
  userId?: string | null
) {
  const resolvedQuestionTypeId = await resolveEkKothayProkashQuestionTypeId(db)
  const currentYear = new Date().getFullYear().toString()

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.ekKothayProkash.create({
          data: {
            phrase: data.phrase,
            oneWord: data.oneWord || null,
            wordMeaningId: data.wordMeaningId || null,
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

export async function getEkKothayProkashStats(db: PrismaClient, input: EkKothayProkashStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.ekKothayProkash.count({ where }),
    db.ekKothayProkash.count({ where: { ...where, difficulty: "EASY" } }),
    db.ekKothayProkash.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.ekKothayProkash.count({ where: { ...where, difficulty: "HARD" } }),
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
