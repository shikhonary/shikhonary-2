import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateGrammarQuestionInput,
  DeleteGrammarQuestionInput,
  GetGrammarQuestionInput,
  ListGrammarQuestionInput,
  UpdateGrammarQuestionInput,
  BulkDeleteGrammarQuestionInput,
  ImportGrammarQuestionInput,
  GrammarQuestionStatsInput,
} from "./grammar-question.schema"

async function resolveGrammarQuestionTypeId(db: any, requestedTypeId?: string | null) {
  if (requestedTypeId) {
    const existing = await db.questionType.findUnique({
      where: { id: requestedTypeId },
      select: { id: true },
    })
    if (existing) return existing.id as string
  }

  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Grammar Question", mode: "insensitive" } },
        { label: { equals: "Grammar Question", mode: "insensitive" } },
        { nameEn: { equals: "GRAMMAR_QUESTION", mode: "insensitive" } },
        { nameBn: { equals: "ব্যাকরণ প্রশ্ন", mode: "insensitive" } },
        { nameBn: { contains: "ব্যাকরণ" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Grammar Question",
        nameBn: "ব্যাকরণ প্রশ্ন",
        label: "Grammar Question",
        mark: 5,
        position: 33,
        descriptionEn: "Grammar Question",
        descriptionBn: "ব্যাকরণ প্রশ্ন",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listGrammarQuestion(db: PrismaClient, input: ListGrammarQuestionInput) {
  const { page, limit, query, subjectId, chapterId, academicChapterId, questionTypeId, difficulty, source, session, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}
  const targetChapterId = academicChapterId || chapterId

  if (subjectId) where.subjectId = subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId
  if (questionTypeId) where.questionTypeId = questionTypeId
  if (difficulty) where.difficulty = difficulty
  if (source) where.source = source
  if (session) where.session = session

  if (query) {
    where.OR = [
      { question: { contains: query, mode: "insensitive" } },
      { answer: { contains: query, mode: "insensitive" } },
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
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.grammarQuestion.findMany({
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
    db.grammarQuestion.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getGrammarQuestionById(db: PrismaClient, input: GetGrammarQuestionInput) {
  const item = await db.grammarQuestion.findUnique({
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
      message: `Grammar Question entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createGrammarQuestion(db: PrismaClient, input: CreateGrammarQuestionInput, userId?: string | null) {
  const data = input
  const resolvedQuestionTypeId = await resolveGrammarQuestionTypeId(db, data.questionTypeId)
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  return db.grammarQuestion.create({
    data: {
      question: data.question,
      answer: data.answer || null,
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
    },
  })
}

export async function updateGrammarQuestion(db: PrismaClient, input: UpdateGrammarQuestionInput, userId?: string | null) {
  const { id, ...data } = input

  await getGrammarQuestionById(db, { id })
  const resolvedQuestionTypeId = data.questionTypeId
    ? await resolveGrammarQuestionTypeId(db, data.questionTypeId)
    : undefined
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    ...(data.question !== undefined ? { question: data.question } : {}),
    ...(data.answer !== undefined ? { answer: data.answer || null } : {}),
    reference: data.reference,
    difficulty: data.difficulty,
    popularityCount: data.popularityCount,
    subjectId: data.subjectId,
    ...(resolvedQuestionTypeId ? { questionTypeId: resolvedQuestionTypeId } : {}),
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

  return db.grammarQuestion.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function deleteGrammarQuestion(db: PrismaClient, input: DeleteGrammarQuestionInput) {
  await getGrammarQuestionById(db, { id: input.id })

  return db.grammarQuestion.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteGrammarQuestion(db: PrismaClient, input: BulkDeleteGrammarQuestionInput) {
  const res = await db.grammarQuestion.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importGrammarQuestion(db: PrismaClient, input: ImportGrammarQuestionInput, userId?: string | null) {
  const currentYear = new Date().getFullYear().toString()

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const resolvedQuestionTypeId = await resolveGrammarQuestionTypeId(tx, data.questionTypeId)
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.grammarQuestion.create({
          data: {
            question: data.question,
            answer: data.answer || null,
            reference: data.reference || [],
            source: data.source ? data.source.trim() : "গাইড বুক",
            session: data.session ? data.session.trim() : currentYear,
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

export async function getGrammarQuestionStats(db: PrismaClient, input: GrammarQuestionStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId
  if (input.questionTypeId) where.questionTypeId = input.questionTypeId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.grammarQuestion.count({ where }),
    db.grammarQuestion.count({ where: { ...where, difficulty: "EASY" } }),
    db.grammarQuestion.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.grammarQuestion.count({ where: { ...where, difficulty: "HARD" } }),
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
