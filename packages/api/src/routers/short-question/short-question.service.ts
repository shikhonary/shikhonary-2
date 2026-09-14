import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateShortQuestionInput,
  DeleteShortQuestionInput,
  GetShortQuestionInput,
  ListShortQuestionsInput,
  UpdateShortQuestionInput,
  BulkDeleteShortQuestionsInput,
  ImportShortQuestionsInput,
  ShortQuestionStatsInput,
} from "./short-question.schema"

// Helper function to resolve 'Short Question' question type ID
async function resolveShortQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Short Question", mode: "insensitive" } },
        { label: { equals: "Short Question", mode: "insensitive" } },
        { nameEn: { equals: "ShortQuestion", mode: "insensitive" } },
        { label: { equals: "ShortQuestion", mode: "insensitive" } },
        { nameBn: { equals: "সংক্ষিপ্ত প্রশ্ন", mode: "insensitive" } },
        { label: { equals: "সংক্ষিপ্ত প্রশ্ন", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Short Question",
        nameBn: "সংক্ষিপ্ত প্রশ্ন",
        label: "Short Question",
        mark: 2,
        position: 26,
        descriptionEn: "Short Questions and Answers",
        descriptionBn: "সংক্ষিপ্ত প্রশ্নোত্তর",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listShortQuestions(db: PrismaClient, input: ListShortQuestionsInput) {
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
      { question: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "newest" || sort === "createdAt_desc") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "oldest" || sort === "createdAt_asc") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "question_asc") {
    orderBy = { question: "asc" }
  } else if (sort === "question_desc") {
    orderBy = { question: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.shortQuestion.findMany({
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
    db.shortQuestion.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getShortQuestionById(db: PrismaClient, input: GetShortQuestionInput) {
  const shortQuestion = await db.shortQuestion.findUnique({
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

  if (!shortQuestion) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Short Question with ID ${input.id} not found`,
    })
  }

  return shortQuestion
}

export async function createShortQuestion(db: PrismaClient, input: CreateShortQuestionInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveShortQuestionTypeId(db)

  return db.shortQuestion.create({
    data: {
      question: data.question,
      reference: data.reference ?? [],
      difficulty: data.difficulty,
      popularityCount: data.popularityCount ?? 0,
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      questionTypeId: resolvedQuestionTypeId,
    },
    include: {
      subject: true,
      chapter: true,
      questionType: true,
    },
  })
}

export async function updateShortQuestion(db: PrismaClient, input: UpdateShortQuestionInput) {
  const { id, ...data } = input

  // Verify existence
  await getShortQuestionById(db, { id })
  const resolvedQuestionTypeId = await resolveShortQuestionTypeId(db)

  return db.shortQuestion.update({
    where: { id },
    data: {
      question: data.question,
      reference: data.reference,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount,
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      questionTypeId: resolvedQuestionTypeId,
    },
    include: {
      subject: true,
      chapter: true,
      questionType: true,
    },
  })
}

export async function deleteShortQuestion(db: PrismaClient, input: DeleteShortQuestionInput) {
  await getShortQuestionById(db, { id: input.id })

  return db.shortQuestion.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteShortQuestions(db: PrismaClient, input: BulkDeleteShortQuestionsInput) {
  const res = await db.shortQuestion.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importShortQuestions(db: PrismaClient, input: ImportShortQuestionsInput) {
  const resolvedQuestionTypeId = await resolveShortQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q

        const createdQuestion = await tx.shortQuestion.create({
          data: {
            question: data.question,
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            chapterId: data.chapterId,
            questionTypeId: resolvedQuestionTypeId,
          },
        })
        results.push(createdQuestion)
      }
      return results
    },
    {
      timeout: 30000,
    }
  )

  return { importedCount: created.length }
}

export async function getShortQuestionStats(db: PrismaClient, input: ShortQuestionStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.shortQuestion.count({ where }),
    db.shortQuestion.count({ where: { ...where, difficulty: "EASY" } }),
    db.shortQuestion.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.shortQuestion.count({ where: { ...where, difficulty: "HARD" } }),
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
