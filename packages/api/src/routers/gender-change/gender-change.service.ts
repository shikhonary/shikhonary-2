import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateGenderChangeInput,
  DeleteGenderChangeInput,
  GetGenderChangeInput,
  ListGenderChangeInput,
  UpdateGenderChangeInput,
  BulkDeleteGenderChangeInput,
  ImportGenderChangeInput,
  GenderChangeStatsInput,
} from "./gender-change.schema"

// Helper function to resolve 'Gender Change' question type ID
async function resolveGenderChangeTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Gender Change", mode: "insensitive" } },
        { label: { equals: "Gender Change", mode: "insensitive" } },
        { nameEn: { equals: "GenderChange", mode: "insensitive" } },
        { label: { equals: "GenderChange", mode: "insensitive" } },
        { nameBn: { equals: "লিঙ্গ পরিবর্তন", mode: "insensitive" } },
        { label: { equals: "লিঙ্গ পরিবর্তন", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Gender Change",
        nameBn: "লিঙ্গ পরিবর্তন",
        label: "Gender Change",
        mark: 5,
        position: 22,
        descriptionEn: "Gender Change Questions",
        descriptionBn: "লিঙ্গ পরিবর্তন প্রশ্নসমূহ",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listGenderChange(db: PrismaClient, input: ListGenderChangeInput) {
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
      { genderWord: { contains: query, mode: "insensitive" } },
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
    db.genderChange.findMany({
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
    db.genderChange.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getGenderChangeById(db: PrismaClient, input: GetGenderChangeInput) {
  const genderChange = await db.genderChange.findUnique({
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

  if (!genderChange) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Gender Change entry with ID ${input.id} not found`,
    })
  }

  return genderChange
}

export async function createGenderChange(db: PrismaClient, input: CreateGenderChangeInput) {
  const questionTypeId = await resolveGenderChangeTypeId(db)

  const chapterId = input.academicChapterId || input.chapterId || null

  return db.genderChange.create({
    data: {
      word: input.word,
      genderWord: input.genderWord || null,
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

export async function updateGenderChange(db: PrismaClient, input: UpdateGenderChangeInput) {
  const { id, chapterId, academicChapterId, ...data } = input

  const existing = await db.genderChange.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Gender Change entry with ID ${id} not found`,
    })
  }

  const targetChapterId = academicChapterId !== undefined ? academicChapterId : chapterId

  return db.genderChange.update({
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

export async function deleteGenderChange(db: PrismaClient, input: DeleteGenderChangeInput) {
  const existing = await db.genderChange.findUnique({
    where: { id: input.id },
  })

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Gender Change entry with ID ${input.id} not found`,
    })
  }

  await db.genderChange.delete({
    where: { id: input.id },
  })

  return { success: true, id: input.id }
}

export async function bulkDeleteGenderChange(db: PrismaClient, input: BulkDeleteGenderChangeInput) {
  const { ids } = input

  const result = await db.genderChange.deleteMany({
    where: {
      id: { in: ids },
    },
  })

  return {
    success: true,
    deletedCount: result.count,
  }
}

export async function importGenderChange(db: PrismaClient, input: ImportGenderChangeInput) {
  const questionTypeId = await resolveGenderChangeTypeId(db)

  const records = input.questions.map((q) => ({
    word: q.word,
    genderWord: q.genderWord || null,
    reference: q.reference ?? [],
    difficulty: q.difficulty ?? "MEDIUM",
    popularityCount: q.popularityCount ?? 0,
    subjectId: q.subjectId,
    academicChapterId: q.academicChapterId || q.chapterId || null,
    questionTypeId,
  }))

  const created = await db.genderChange.createMany({
    data: records,
  })

  return {
    success: true,
    importedCount: created.count,
  }
}

export async function getGenderChangeStats(db: PrismaClient, input: GenderChangeStatsInput) {
  const { subjectId, chapterId, academicChapterId } = input
  const targetChapterId = academicChapterId || chapterId

  const where: any = {}
  if (subjectId) where.subjectId = subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [total, easyCount, mediumCount, hardCount] = await Promise.all([
    db.genderChange.count({ where }),
    db.genderChange.count({ where: { ...where, difficulty: "EASY" } }),
    db.genderChange.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.genderChange.count({ where: { ...where, difficulty: "HARD" } }),
  ])

  return {
    total,
    easyCount,
    mediumCount,
    hardCount,
  }
}
