import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateEssayInput,
  DeleteEssayInput,
  GetEssayInput,
  ListEssaysInput,
  UpdateEssayInput,
  BulkDeleteEssaysInput,
  ImportEssaysInput,
  EssayStatsInput,
} from "./essay.schema"

// Helper function to resolve 'Essay' question type ID
async function resolveEssayQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Essay", mode: "insensitive" } },
        { label: { equals: "Essay", mode: "insensitive" } },
        { nameEn: { equals: "Essay Writing", mode: "insensitive" } },
        { label: { equals: "Essay Writing", mode: "insensitive" } },
        { nameEn: { equals: "Composition", mode: "insensitive" } },
        { label: { equals: "Composition", mode: "insensitive" } },
        { nameBn: { equals: "প্রবন্ধ রচনা", mode: "insensitive" } },
        { label: { equals: "প্রবন্ধ রচনা", mode: "insensitive" } },
        { nameBn: { equals: "রচনা", mode: "insensitive" } },
        { label: { equals: "রচনা", mode: "insensitive" } },
        { nameBn: { equals: "প্রবন্ধ", mode: "insensitive" } },
        { label: { equals: "প্রবন্ধ", mode: "insensitive" } },
        { nameBn: { equals: "প্রবন্ধ ও রচনা লিখন", mode: "insensitive" } },
        { label: { equals: "প্রবন্ধ ও রচনা লিখন", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Essay",
        nameBn: "প্রবন্ধ রচনা",
        label: "Essay",
        mark: 20,
        position: 15,
        descriptionEn: "Essay / Composition Writing",
        descriptionBn: "প্রবন্ধ ও রচনা লিখন",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listEssays(db: PrismaClient, input: ListEssaysInput) {
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
    db.essay.findMany({
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
          },
        },
      },
    }),
    db.essay.count({ where }),
  ])

  const totalPages = Math.ceil(totalItems / resolvedLimit) || 1

  return {
    items,
    totalItems,
    totalPages,
    currentPage: resolvedPage,
  }
}

export async function getEssayById(db: PrismaClient, input: GetEssayInput) {
  const essay = await db.essay.findUnique({
    where: { id: input.id },
    include: {
      subject: {
        include: {
          classSubjects: {
            include: {
              academicClass: true,
            },
          },
        },
      },
      questionType: true,
    },
  })

  if (!essay) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Essay not found",
    })
  }

  return essay
}

export async function createEssay(db: PrismaClient, input: CreateEssayInput) {
  const questionTypeId = await resolveEssayQuestionTypeId(db)

  return db.essay.create({
    data: {
      title: input.title,
      reference: input.reference,
      difficulty: input.difficulty,
      popularityCount: input.popularityCount,
      subjectId: input.subjectId,
      questionTypeId,
    },
    include: {
      subject: true,
      questionType: true,
    },
  })
}

export async function updateEssay(db: PrismaClient, input: UpdateEssayInput) {
  const { id, ...data } = input

  return db.essay.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.reference !== undefined && { reference: data.reference }),
      ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
      ...(data.popularityCount !== undefined && { popularityCount: data.popularityCount }),
      ...(data.subjectId !== undefined && { subjectId: data.subjectId }),
    },
    include: {
      subject: true,
      questionType: true,
    },
  })
}

export async function deleteEssay(db: PrismaClient, input: DeleteEssayInput) {
  return db.essay.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteEssays(db: PrismaClient, input: BulkDeleteEssaysInput) {
  const res = await db.essay.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })

  return { deletedCount: res.count }
}

export async function importEssays(db: PrismaClient, input: ImportEssaysInput) {
  const questionTypeId = await resolveEssayQuestionTypeId(db)

  return db.$transaction(async (tx) => {
    let count = 0
    for (const t of input.essays) {
      await tx.essay.create({
        data: {
          title: t.title,
          reference: t.reference,
          difficulty: t.difficulty,
          popularityCount: t.popularityCount,
          subjectId: t.subjectId,
          questionTypeId,
        },
      })
      count++
    }
    return { importedCount: count }
  })
}

export async function getEssayStats(db: PrismaClient, input: EssayStatsInput) {
  const where: any = {}
  if (input.subjectId) {
    where.subjectId = input.subjectId
  }

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.essay.count({ where }),
    db.essay.count({ where: { ...where, difficulty: "EASY" } }),
    db.essay.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.essay.count({ where: { ...where, difficulty: "HARD" } }),
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
