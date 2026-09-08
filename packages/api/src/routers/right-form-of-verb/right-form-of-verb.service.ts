import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateRightFormOfVerbInput,
  DeleteRightFormOfVerbInput,
  GetRightFormOfVerbInput,
  ListRightFormOfVerbsInput,
  UpdateRightFormOfVerbInput,
  BulkDeleteRightFormOfVerbsInput,
  ImportRightFormOfVerbsInput,
  RightFormOfVerbsStatsInput,
} from "./right-form-of-verb.schema"

// Helper function to resolve 'Right Form of Verbs' question type ID
async function resolveRightFormOfVerbQuestionTypeId(db: any) {
  const qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Right Form of Verbs", mode: "insensitive" } },
        { label: { equals: "Right Form of Verbs", mode: "insensitive" } },
        { nameEn: { equals: "RIGHT_FORM_OF_VERBS", mode: "insensitive" } },
        { nameBn: { contains: "ক্রিয়ার সঠিক রূপ" } },
        { nameBn: { contains: "Right Form of Verbs" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Required 'Right Form of Verbs' Question Type template was not found. Please create it under Question Types first.",
    })
  }

  return qt.id as string
}

export async function listRightFormOfVerbs(db: PrismaClient, input: ListRightFormOfVerbsInput) {
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
    db.rightFormOfVerb.findMany({
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
    db.rightFormOfVerb.count({ where }),
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

export async function getRightFormOfVerbById(db: PrismaClient, input: GetRightFormOfVerbInput) {
  const rightFormOfVerb = await db.rightFormOfVerb.findUnique({
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

  if (!rightFormOfVerb) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Right Form of Verbs with ID ${input.id} not found`,
    })
  }

  return {
    ...rightFormOfVerb,
    chapter: rightFormOfVerb.academicChapter,
    chapterId: rightFormOfVerb.academicChapterId,
  }
}

export async function createRightFormOfVerb(db: PrismaClient, input: CreateRightFormOfVerbInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveRightFormOfVerbQuestionTypeId(db)

  const created = await db.rightFormOfVerb.create({
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

export async function updateRightFormOfVerb(db: PrismaClient, input: UpdateRightFormOfVerbInput) {
  const { id, ...data } = input

  // Verify existence
  await getRightFormOfVerbById(db, { id })
  const resolvedQuestionTypeId = await resolveRightFormOfVerbQuestionTypeId(db)

  const updated = await db.rightFormOfVerb.update({
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

export async function deleteRightFormOfVerb(db: PrismaClient, input: DeleteRightFormOfVerbInput) {
  await getRightFormOfVerbById(db, { id: input.id })

  return db.rightFormOfVerb.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteRightFormOfVerbs(db: PrismaClient, input: BulkDeleteRightFormOfVerbsInput) {
  const res = await db.rightFormOfVerb.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importRightFormOfVerbs(db: PrismaClient, input: ImportRightFormOfVerbsInput) {
  const resolvedQuestionTypeId = await resolveRightFormOfVerbQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const p of input.rightFormOfVerbs) {
        const data = p

        const createdItem = await tx.rightFormOfVerb.create({
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

export async function getRightFormOfVerbsStats(db: PrismaClient, input: RightFormOfVerbsStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.academicChapterId = input.chapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.rightFormOfVerb.count({ where }),
    db.rightFormOfVerb.count({ where: { ...where, difficulty: "EASY" } }),
    db.rightFormOfVerb.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.rightFormOfVerb.count({ where: { ...where, difficulty: "HARD" } }),
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
