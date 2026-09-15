import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateMakeSentencesInput,
  DeleteMakeSentencesInput,
  GetMakeSentencesInput,
  ListMakeSentencesInput,
  UpdateMakeSentencesInput,
  BulkDeleteMakeSentencesInput,
  ImportMakeSentencesInput,
  MakeSentencesStatsInput,
} from "./make-sentences.schema"

async function resolveMakeSentencesQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Make Sentences", mode: "insensitive" } },
        { label: { equals: "Make Sentences", mode: "insensitive" } },
        { nameEn: { equals: "Sentence Making", mode: "insensitive" } },
        { label: { equals: "Sentence Making", mode: "insensitive" } },
        { nameEn: { equals: "MAKE_SENTENCES", mode: "insensitive" } },
        { nameBn: { equals: "বাক্য গঠন", mode: "insensitive" } },
        { nameBn: { contains: "বাক্য গঠন" } },
        { nameBn: { contains: "বাক্য তৈরি" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Make Sentences",
        nameBn: "বাক্য গঠন",
        label: "Make Sentences",
        mark: 5,
        position: 19,
        descriptionEn: "Make Sentences",
        descriptionBn: "বাক্য গঠন",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listMakeSentences(db: PrismaClient, input: ListMakeSentencesInput) {
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
      { word: { contains: query, mode: "insensitive" } },
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
    db.makeSentences.findMany({
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
    db.makeSentences.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getMakeSentencesById(db: PrismaClient, input: GetMakeSentencesInput) {
  const item = await db.makeSentences.findUnique({
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
      message: `Make Sentences word entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createMakeSentences(db: PrismaClient, input: CreateMakeSentencesInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveMakeSentencesQuestionTypeId(db)
  const targetChapterId = data.academicChapterId || data.chapterId || null

  return db.makeSentences.create({
    data: {
      word: data.word,
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

export async function updateMakeSentences(db: PrismaClient, input: UpdateMakeSentencesInput) {
  const { id, ...data } = input

  await getMakeSentencesById(db, { id })
  const resolvedQuestionTypeId = await resolveMakeSentencesQuestionTypeId(db)
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId

  const updateData: any = {
    word: data.word,
    reference: data.reference,
    difficulty: data.difficulty,
    popularityCount: data.popularityCount,
    subjectId: data.subjectId,
    questionTypeId: resolvedQuestionTypeId,
  }

  if (targetChapterId !== undefined) {
    updateData.academicChapterId = targetChapterId
  }

  return db.makeSentences.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function deleteMakeSentences(db: PrismaClient, input: DeleteMakeSentencesInput) {
  await getMakeSentencesById(db, { id: input.id })

  return db.makeSentences.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteMakeSentences(db: PrismaClient, input: BulkDeleteMakeSentencesInput) {
  const res = await db.makeSentences.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importMakeSentences(db: PrismaClient, input: ImportMakeSentencesInput) {
  const resolvedQuestionTypeId = await resolveMakeSentencesQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.makeSentences.create({
          data: {
            word: data.word,
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

export async function getMakeSentencesStats(db: PrismaClient, input: MakeSentencesStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.makeSentences.count({ where }),
    db.makeSentences.count({ where: { ...where, difficulty: "EASY" } }),
    db.makeSentences.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.makeSentences.count({ where: { ...where, difficulty: "HARD" } }),
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
