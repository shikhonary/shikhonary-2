import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreatePartsOfSpeechInput,
  DeletePartsOfSpeechInput,
  GetPartsOfSpeechInput,
  ListPartsOfSpeechInput,
  UpdatePartsOfSpeechInput,
  BulkDeletePartsOfSpeechInput,
  ImportPartsOfSpeechInput,
  PartsOfSpeechStatsInput,
} from "./parts-of-speech.schema"

// Helper function to resolve 'Parts of Speech' question type ID
async function resolvePartsOfSpeechQuestionTypeId(db: any) {
  const qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Parts of Speech", mode: "insensitive" } },
        { label: { equals: "Parts of Speech", mode: "insensitive" } },
        { nameEn: { equals: "PARTS_OF_SPEECH", mode: "insensitive" } },
        { nameBn: { contains: "পদ নির্ণয়" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Required 'Parts of Speech' Question Type template was not found. Please create it under Question Types first.",
    })
  }

  return qt.id as string
}

export async function listPartsOfSpeech(db: PrismaClient, input: ListPartsOfSpeechInput) {
  const { page, limit, query, subjectId, chapterId, difficulty, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}

  if (subjectId) where.subjectId = subjectId
  if (chapterId) where.academicChapterId = chapterId
  if (difficulty) where.difficulty = difficulty

  if (query) {
    where.OR = [
      { content: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "newest" || sort === "createdAt_desc") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "oldest" || sort === "createdAt_asc") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "content_asc" || sort === "name_asc") {
    orderBy = { content: "asc" }
  } else if (sort === "content_desc" || sort === "name_desc") {
    orderBy = { content: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.partsOfSpeech.findMany({
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
    db.partsOfSpeech.count({ where }),
  ])

  return {
    items: items.map((p) => ({
      ...p,
      chapter: p.academicChapter,
      chapterId: p.academicChapterId,
    })),
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getPartsOfSpeechById(db: PrismaClient, input: GetPartsOfSpeechInput) {
  const partsOfSpeech = await db.partsOfSpeech.findUnique({
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

  if (!partsOfSpeech) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Parts of Speech with ID ${input.id} not found`,
    })
  }

  return {
    ...partsOfSpeech,
    chapter: partsOfSpeech.academicChapter,
    chapterId: partsOfSpeech.academicChapterId,
  }
}

export async function createPartsOfSpeech(db: PrismaClient, input: CreatePartsOfSpeechInput) {
  const data = input
  const resolvedQuestionTypeId = await resolvePartsOfSpeechQuestionTypeId(db)

  const created = await db.partsOfSpeech.create({
    data: {
      content: data.content,
      reference: data.reference ?? [],
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      subjectId: data.subjectId,
      academicChapterId: data.chapterId || null,
      questionTypeId: resolvedQuestionTypeId,
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })

  return {
    ...created,
    chapter: created.academicChapter,
    chapterId: created.academicChapterId,
  }
}

export async function updatePartsOfSpeech(db: PrismaClient, input: UpdatePartsOfSpeechInput) {
  const { id, ...data } = input

  // Verify existence
  await getPartsOfSpeechById(db, { id })
  const resolvedQuestionTypeId = await resolvePartsOfSpeechQuestionTypeId(db)

  const updated = await db.partsOfSpeech.update({
    where: { id },
    data: {
      content: data.content,
      reference: data.reference,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount,
      subjectId: data.subjectId,
      academicChapterId: data.chapterId !== undefined ? data.chapterId : undefined,
      questionTypeId: resolvedQuestionTypeId,
    },
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })

  return {
    ...updated,
    chapter: updated.academicChapter,
    chapterId: updated.academicChapterId,
  }
}

export async function deletePartsOfSpeech(db: PrismaClient, input: DeletePartsOfSpeechInput) {
  await getPartsOfSpeechById(db, { id: input.id })

  return db.partsOfSpeech.delete({
    where: { id: input.id },
  })
}

export async function bulkDeletePartsOfSpeech(db: PrismaClient, input: BulkDeletePartsOfSpeechInput) {
  const res = await db.partsOfSpeech.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importPartsOfSpeech(db: PrismaClient, input: ImportPartsOfSpeechInput) {
  const resolvedQuestionTypeId = await resolvePartsOfSpeechQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const p of input.partsOfSpeech) {
        const data = p

        const createdItem = await tx.partsOfSpeech.create({
          data: {
            content: data.content,
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            academicChapterId: data.chapterId || null,
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

export async function getPartsOfSpeechStats(db: PrismaClient, input: PartsOfSpeechStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.academicChapterId = input.chapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.partsOfSpeech.count({ where }),
    db.partsOfSpeech.count({ where: { ...where, difficulty: "EASY" } }),
    db.partsOfSpeech.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.partsOfSpeech.count({ where: { ...where, difficulty: "HARD" } }),
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
