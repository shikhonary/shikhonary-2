import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateAmplificationInput,
  DeleteAmplificationInput,
  GetAmplificationInput,
  ListAmplificationsInput,
  UpdateAmplificationInput,
  BulkDeleteAmplificationsInput,
  ImportAmplificationsInput,
  AmplificationStatsInput,
} from "./amplification.schema"

// Helper function to resolve 'Amplification' question type ID
async function resolveAmplificationQuestionTypeId(db: any) {
  const qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Amplification", mode: "insensitive" } },
        { label: { equals: "Amplification", mode: "insensitive" } },
        { nameBn: { equals: "ভাব-সম্প্রসারণ", mode: "insensitive" } },
        { label: { equals: "ভাব-সম্প্রসারণ", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Required 'Amplification' (ভাব-সম্প্রসারণ) Question Type template was not found. Please create it under Question Types first.",
    })
  }

  return qt.id as string
}

export async function listAmplifications(db: PrismaClient, input: ListAmplificationsInput) {
  const { page, limit, query, subjectId, chapterId, difficulty, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}

  if (subjectId) where.subjectId = subjectId
  if (chapterId) where.chapterId = chapterId
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
  } else if (sort === "name_asc") {
    orderBy = { title: "asc" }
  } else if (sort === "name_desc") {
    orderBy = { title: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.amplification.findMany({
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
        chapter: {
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
    db.amplification.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getAmplificationById(db: PrismaClient, input: GetAmplificationInput) {
  const amplification = await db.amplification.findUnique({
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

  if (!amplification) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Amplification with ID ${input.id} not found`,
    })
  }

  return amplification
}

export async function createAmplification(db: PrismaClient, input: CreateAmplificationInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveAmplificationQuestionTypeId(db)

  return db.amplification.create({
    data: {
      title: data.title,
      reference: data.reference ?? [],
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      subjectId: data.subjectId,
      chapterId: data.chapterId || null,
      questionTypeId: resolvedQuestionTypeId,
    },
    include: {
      subject: true,
      chapter: true,
      questionType: true,
    },
  })
}

export async function updateAmplification(db: PrismaClient, input: UpdateAmplificationInput) {
  const { id, ...data } = input

  // Verify existence
  await getAmplificationById(db, { id })
  const resolvedQuestionTypeId = await resolveAmplificationQuestionTypeId(db)

  return db.amplification.update({
    where: { id },
    data: {
      title: data.title,
      reference: data.reference,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount,
      subjectId: data.subjectId,
      chapterId: data.chapterId || null,
      questionTypeId: resolvedQuestionTypeId,
    },
    include: {
      subject: true,
      chapter: true,
      questionType: true,
    },
  })
}

export async function deleteAmplification(db: PrismaClient, input: DeleteAmplificationInput) {
  await getAmplificationById(db, { id: input.id })

  return db.amplification.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteAmplifications(db: PrismaClient, input: BulkDeleteAmplificationsInput) {
  const res = await db.amplification.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importAmplifications(db: PrismaClient, input: ImportAmplificationsInput) {
  const resolvedQuestionTypeId = await resolveAmplificationQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const p of input.amplifications) {
        const data = p

        const createdParagraph = await tx.amplification.create({
          data: {
            title: data.title,
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            chapterId: data.chapterId || null,
            questionTypeId: resolvedQuestionTypeId,
          },
        })
        results.push(createdParagraph)
      }
      return results
    },
    {
      timeout: 30000,
    }
  )

  return { importedCount: created.length }
}

export async function getAmplificationStats(db: PrismaClient, input: AmplificationStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.amplification.count({ where }),
    db.amplification.count({ where: { ...where, difficulty: "EASY" } }),
    db.amplification.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.amplification.count({ where: { ...where, difficulty: "HARD" } }),
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
