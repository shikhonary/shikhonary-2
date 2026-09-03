import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateEssenceInput,
  DeleteEssenceInput,
  GetEssenceInput,
  ListEssencesInput,
  UpdateEssenceInput,
  BulkDeleteEssencesInput,
  ImportEssencesInput,
  EssenceStatsInput,
} from "./essence.schema"

// Helper function to resolve 'Essence' question type ID
async function resolveEssenceQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Essence", mode: "insensitive" } },
        { label: { equals: "Essence", mode: "insensitive" } },
        { nameEn: { equals: "Gist", mode: "insensitive" } },
        { label: { equals: "Gist", mode: "insensitive" } },
        { nameEn: { equals: "Substance", mode: "insensitive" } },
        { label: { equals: "Substance", mode: "insensitive" } },
        { nameEn: { equals: "Theme", mode: "insensitive" } },
        { label: { equals: "Theme", mode: "insensitive" } },
        { nameBn: { equals: "সারমর্ম", mode: "insensitive" } },
        { label: { equals: "সারমর্ম", mode: "insensitive" } },
        { nameBn: { equals: "মর্মার্থ", mode: "insensitive" } },
        { label: { equals: "মর্মার্থ", mode: "insensitive" } },
        { nameBn: { equals: "মূলভাব", mode: "insensitive" } },
        { label: { equals: "মূলভাব", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Essence",
        nameBn: "সারমর্ম / মূলভাব",
        label: "Essence",
        mark: 10,
        position: 12,
        descriptionEn: "Essence / Gist / Substance Writing",
        descriptionBn: "সারমর্ম ও মূলভাব লিখন",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listEssences(db: PrismaClient, input: ListEssencesInput) {
  const { page, limit, query, subjectId, difficulty, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}

  if (subjectId) where.subjectId = subjectId
  if (difficulty) where.difficulty = difficulty

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "newest" || sort === "createdAt_desc") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "oldest" || sort === "createdAt_asc") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "title_asc" || sort === "name_asc") {
    orderBy = { title: "asc" }
  } else if (sort === "title_desc" || sort === "name_desc") {
    orderBy = { title: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.essence.findMany({
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
    db.essence.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getEssenceById(db: PrismaClient, input: GetEssenceInput) {
  const essence = await db.essence.findUnique({
    where: { id: input.id },
    include: {
      subject: {
        include: {
          classSubjects: true,
        },
      },
      questionType: true,
    },
  })

  if (!essence) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Essence with ID ${input.id} not found`,
    })
  }

  return essence
}

export async function createEssence(db: PrismaClient, input: CreateEssenceInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveEssenceQuestionTypeId(db)

  return db.essence.create({
    data: {
      title: data.title,
      reference: data.reference ?? [],
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      subjectId: data.subjectId,
      questionTypeId: resolvedQuestionTypeId,
    },
    include: {
      subject: true,
      questionType: true,
    },
  })
}

export async function updateEssence(db: PrismaClient, input: UpdateEssenceInput) {
  const { id, ...data } = input

  // Verify existence
  await getEssenceById(db, { id })
  const resolvedQuestionTypeId = await resolveEssenceQuestionTypeId(db)

  return db.essence.update({
    where: { id },
    data: {
      title: data.title,
      reference: data.reference,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount,
      subjectId: data.subjectId,
      questionTypeId: resolvedQuestionTypeId,
    },
    include: {
      subject: true,
      questionType: true,
    },
  })
}

export async function deleteEssence(db: PrismaClient, input: DeleteEssenceInput) {
  await getEssenceById(db, { id: input.id })

  return db.essence.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteEssences(db: PrismaClient, input: BulkDeleteEssencesInput) {
  const res = await db.essence.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importEssences(db: PrismaClient, input: ImportEssencesInput) {
  const resolvedQuestionTypeId = await resolveEssenceQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const e of input.essences) {
        const data = e

        const createdEssence = await tx.essence.create({
          data: {
            title: data.title,
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            questionTypeId: resolvedQuestionTypeId,
          },
        })
        results.push(createdEssence)
      }
      return results
    },
    {
      timeout: 30000,
    }
  )

  return { importedCount: created.length }
}

export async function getEssenceStats(db: PrismaClient, input: EssenceStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.essence.count({ where }),
    db.essence.count({ where: { ...where, difficulty: "EASY" } }),
    db.essence.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.essence.count({ where: { ...where, difficulty: "HARD" } }),
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
