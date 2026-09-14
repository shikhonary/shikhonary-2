import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateDescriptiveQuestionInput,
  DeleteDescriptiveQuestionInput,
  GetDescriptiveQuestionInput,
  ListDescriptiveQuestionsInput,
  UpdateDescriptiveQuestionInput,
  BulkDeleteDescriptiveQuestionsInput,
  ImportDescriptiveQuestionsInput,
  DescriptiveQuestionStatsInput,
} from "./descriptive-question.schema"

// Helper function to resolve 'Descriptive Question' question type ID
async function resolveDescriptiveQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Descriptive Question", mode: "insensitive" } },
        { label: { equals: "Descriptive Question", mode: "insensitive" } },
        { nameEn: { equals: "DescriptiveQuestion", mode: "insensitive" } },
        { label: { equals: "DescriptiveQuestion", mode: "insensitive" } },
        { nameBn: { equals: "রচনামূলক প্রশ্ন", mode: "insensitive" } },
        { label: { equals: "রচনামূলক প্রশ্ন", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Descriptive Question",
        nameBn: "রচনামূলক প্রশ্ন",
        label: "Descriptive Question",
        mark: 10,
        position: 18,
        descriptionEn: "Descriptive Questions",
        descriptionBn: "রচনামূলক প্রশ্ন",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listDescriptiveQuestions(db: PrismaClient, input: ListDescriptiveQuestionsInput) {
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
    db.descriptiveQuestion.findMany({
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
    db.descriptiveQuestion.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getDescriptiveQuestionById(db: PrismaClient, input: GetDescriptiveQuestionInput) {
  const descriptiveQuestion = await db.descriptiveQuestion.findUnique({
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

  if (!descriptiveQuestion) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Descriptive Question with ID ${input.id} not found`,
    })
  }

  return descriptiveQuestion
}

export async function createDescriptiveQuestion(db: PrismaClient, input: CreateDescriptiveQuestionInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveDescriptiveQuestionTypeId(db)

  return db.descriptiveQuestion.create({
    data: {
      question: data.question,
      answer: data.answer ?? null,
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

export async function updateDescriptiveQuestion(db: PrismaClient, input: UpdateDescriptiveQuestionInput) {
  const { id, ...data } = input

  // Verify existence
  await getDescriptiveQuestionById(db, { id })
  const resolvedQuestionTypeId = await resolveDescriptiveQuestionTypeId(db)

  return db.descriptiveQuestion.update({
    where: { id },
    data: {
      question: data.question,
      answer: data.answer,
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

export async function deleteDescriptiveQuestion(db: PrismaClient, input: DeleteDescriptiveQuestionInput) {
  await getDescriptiveQuestionById(db, { id: input.id })

  return db.descriptiveQuestion.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteDescriptiveQuestions(db: PrismaClient, input: BulkDeleteDescriptiveQuestionsInput) {
  const res = await db.descriptiveQuestion.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importDescriptiveQuestions(db: PrismaClient, input: ImportDescriptiveQuestionsInput) {
  const resolvedQuestionTypeId = await resolveDescriptiveQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q

        const createdQuestion = await tx.descriptiveQuestion.create({
          data: {
            question: data.question,
            answer: data.answer ?? null,
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

export async function getDescriptiveQuestionStats(db: PrismaClient, input: DescriptiveQuestionStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.descriptiveQuestion.count({ where }),
    db.descriptiveQuestion.count({ where: { ...where, difficulty: "EASY" } }),
    db.descriptiveQuestion.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.descriptiveQuestion.count({ where: { ...where, difficulty: "HARD" } }),
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
