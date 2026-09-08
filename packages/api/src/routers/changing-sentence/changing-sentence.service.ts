import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateChangingSentenceInput,
  DeleteChangingSentenceInput,
  GetChangingSentenceInput,
  ListChangingSentencesInput,
  UpdateChangingSentenceInput,
  BulkDeleteChangingSentencesInput,
  ImportChangingSentencesInput,
  ChangingSentencesStatsInput,
} from "./changing-sentence.schema"

// Helper function to resolve 'Changing Sentences' question type ID
async function resolveChangingSentenceQuestionTypeId(db: any) {
  const qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Changing Sentences", mode: "insensitive" } },
        { label: { equals: "Changing Sentences", mode: "insensitive" } },
        { nameEn: { equals: "CHANGING_SENTENCES", mode: "insensitive" } },
        { nameEn: { equals: "Transformation of Sentences", mode: "insensitive" } },
        { nameBn: { contains: "বাক্য রূপান্তর" } },
        { nameBn: { contains: "Changing Sentences" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Required 'Changing Sentences' Question Type template was not found. Please create it under Question Types first.",
    })
  }

  return qt.id as string
}

export async function listChangingSentences(db: PrismaClient, input: ListChangingSentencesInput) {
  const { page, limit, query, subjectId, difficulty, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}

  if (subjectId) where.subjectId = subjectId
  if (difficulty) where.difficulty = difficulty

  if (query) {
    where.OR = [
      { content: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
      { options: { has: query } },
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
    (db as any).changingSentence.findMany({
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
    (db as any).changingSentence.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getChangingSentenceById(db: PrismaClient, input: GetChangingSentenceInput) {
  const changingSentence = await (db as any).changingSentence.findUnique({
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

  if (!changingSentence) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Changing Sentence with ID ${input.id} not found`,
    })
  }

  return changingSentence
}

export async function createChangingSentence(db: PrismaClient, input: CreateChangingSentenceInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveChangingSentenceQuestionTypeId(db)

  return (db as any).changingSentence.create({
    data: {
      content: data.content ?? null,
      options: data.options ?? [],
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

export async function updateChangingSentence(db: PrismaClient, input: UpdateChangingSentenceInput) {
  const { id, ...data } = input

  const existing = await (db as any).changingSentence.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Changing Sentence with ID ${id} not found`,
    })
  }

  return (db as any).changingSentence.update({
    where: { id },
    data: {
      ...(data.content !== undefined && { content: data.content }),
      ...(data.options !== undefined && { options: data.options }),
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

export async function deleteChangingSentence(db: PrismaClient, input: DeleteChangingSentenceInput) {
  const existing = await (db as any).changingSentence.findUnique({
    where: { id: input.id },
  })

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Changing Sentence with ID ${input.id} not found`,
    })
  }

  return (db as any).changingSentence.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteChangingSentences(db: PrismaClient, input: BulkDeleteChangingSentencesInput) {
  const result = await (db as any).changingSentence.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })

  return {
    success: true,
    count: result.count,
  }
}

export async function importChangingSentences(db: PrismaClient, input: ImportChangingSentencesInput) {
  const { changingSentences } = input

  if (!changingSentences || changingSentences.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No Changing Sentences provided for import",
    })
  }

  const resolvedQuestionTypeId = await resolveChangingSentenceQuestionTypeId(db)

  return db.$transaction(async (tx: any) => {
    const createdItems = []

    for (const item of changingSentences) {
      const created = await tx.changingSentence.create({
        data: {
          content: item.content ?? null,
          options: item.options ?? [],
          reference: item.reference ?? [],
          difficulty: item.difficulty ?? "MEDIUM",
          popularityCount: item.popularityCount ?? 0,
          subjectId: item.subjectId,
          questionTypeId: resolvedQuestionTypeId,
        },
      })
      createdItems.push(created)
    }

    return {
      success: true,
      count: createdItems.length,
      items: createdItems,
    }
  })
}

export async function getChangingSentencesStats(db: PrismaClient, input: ChangingSentencesStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    (db as any).changingSentence.count({ where }),
    (db as any).changingSentence.count({ where: { ...where, difficulty: "EASY" } }),
    (db as any).changingSentence.count({ where: { ...where, difficulty: "MEDIUM" } }),
    (db as any).changingSentence.count({ where: { ...where, difficulty: "HARD" } }),
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
