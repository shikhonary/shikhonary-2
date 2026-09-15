import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateSynonymInput,
  DeleteSynonymInput,
  GetSynonymInput,
  ListSynonymInput,
  UpdateSynonymInput,
  BulkDeleteSynonymInput,
  ImportSynonymInput,
  SynonymStatsInput,
} from "./synonym.schema"

// Helper function to resolve 'Synonym' question type ID
async function resolveSynonymTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Synonym", mode: "insensitive" } },
        { label: { equals: "Synonym", mode: "insensitive" } },
        { nameEn: { equals: "Synonym Word", mode: "insensitive" } },
        { label: { equals: "Synonym Word", mode: "insensitive" } },
        { nameBn: { equals: "সমার্থক শব্দ", mode: "insensitive" } },
        { label: { equals: "সমার্থক শব্দ", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Synonym",
        nameBn: "সমার্থক শব্দ",
        label: "Synonym",
        mark: 5,
        position: 23,
        descriptionEn: "Synonym Questions",
        descriptionBn: "সমার্থক শব্দ প্রশ্নসমূহ",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listSynonym(db: PrismaClient, input: ListSynonymInput) {
  const { page, limit, query, subjectId, chapterId, academicChapterId, difficulty, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const targetChapterId = academicChapterId || chapterId

  const where: any = {}

  if (subjectId) where.subjectId = subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId
  if (difficulty) where.difficulty = difficulty

  if (query) {
    where.OR = [
      { word: { contains: query, mode: "insensitive" } },
      { synonymWord: { contains: query, mode: "insensitive" } },
      { synonyms: { has: query } },
      { reference: { has: query } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "newest" || sort === "createdAt_desc") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "oldest" || sort === "createdAt_asc") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "word_asc") {
    orderBy = { word: "asc" }
  } else if (sort === "word_desc") {
    orderBy = { word: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.synonym.findMany({
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
    db.synonym.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getSynonymById(db: PrismaClient, input: GetSynonymInput) {
  const synonym = await db.synonym.findUnique({
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

  if (!synonym) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Synonym entry with ID ${input.id} not found`,
    })
  }

  return synonym
}

export async function createSynonym(db: PrismaClient, input: CreateSynonymInput) {
  const questionTypeId = await resolveSynonymTypeId(db)

  const chapterId = input.academicChapterId || input.chapterId || null

  return db.synonym.create({
    data: {
      word: input.word,
      synonymWord: input.synonymWord || null,
      synonyms: input.synonyms ?? [],
      reference: input.reference ?? [],
      difficulty: input.difficulty ?? "MEDIUM",
      popularityCount: input.popularityCount ?? 0,
      subjectId: input.subjectId,
      academicChapterId: chapterId,
      questionTypeId,
    },
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
  })
}

export async function updateSynonym(db: PrismaClient, input: UpdateSynonymInput) {
  const { id, chapterId, academicChapterId, ...data } = input

  const existing = await db.synonym.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Synonym entry with ID ${id} not found`,
    })
  }

  const targetChapterId = academicChapterId !== undefined ? academicChapterId : chapterId

  return db.synonym.update({
    where: { id },
    data: {
      ...data,
      ...(targetChapterId !== undefined ? { academicChapterId: targetChapterId } : {}),
    },
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
  })
}

export async function deleteSynonym(db: PrismaClient, input: DeleteSynonymInput) {
  const existing = await db.synonym.findUnique({
    where: { id: input.id },
  })

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Synonym entry with ID ${input.id} not found`,
    })
  }

  await db.synonym.delete({
    where: { id: input.id },
  })

  return { success: true, id: input.id }
}

export async function bulkDeleteSynonym(db: PrismaClient, input: BulkDeleteSynonymInput) {
  const { ids } = input

  const result = await db.synonym.deleteMany({
    where: {
      id: { in: ids },
    },
  })

  return {
    success: true,
    deletedCount: result.count,
  }
}

export async function importSynonym(db: PrismaClient, input: ImportSynonymInput) {
  const questionTypeId = await resolveSynonymTypeId(db)

  const records = input.questions.map((q) => ({
    word: q.word,
    synonymWord: q.synonymWord || null,
    synonyms: q.synonyms ?? [],
    reference: q.reference ?? [],
    difficulty: q.difficulty ?? "MEDIUM",
    popularityCount: q.popularityCount ?? 0,
    subjectId: q.subjectId,
    academicChapterId: q.academicChapterId || q.chapterId || null,
    questionTypeId,
  }))

  const created = await db.synonym.createMany({
    data: records,
  })

  return {
    success: true,
    importedCount: created.count,
  }
}

export async function getSynonymStats(db: PrismaClient, input: SynonymStatsInput) {
  const { subjectId, chapterId, academicChapterId } = input
  const targetChapterId = academicChapterId || chapterId

  const where: any = {}
  if (subjectId) where.subjectId = subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [total, easyCount, mediumCount, hardCount] = await Promise.all([
    db.synonym.count({ where }),
    db.synonym.count({ where: { ...where, difficulty: "EASY" } }),
    db.synonym.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.synonym.count({ where: { ...where, difficulty: "HARD" } }),
  ])

  return {
    total,
    easyCount,
    mediumCount,
    hardCount,
  }
}
