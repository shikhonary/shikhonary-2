import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateParagraphInput,
  DeleteParagraphInput,
  GetParagraphInput,
  ListParagraphsInput,
  UpdateParagraphInput,
  BulkDeleteParagraphsInput,
  ImportParagraphsInput,
  ParagraphStatsInput,
} from "./paragraph.schema"

// Helper function to resolve 'Paragraph' question type ID
async function resolveParagraphQuestionTypeId(db: any) {
  const qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Paragraph", mode: "insensitive" } },
        { label: { equals: "Paragraph", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Required 'Paragraph' Question Type template was not found. Please create it under Question Types first.",
    })
  }

  return qt.id as string
}

export async function listParagraphs(db: PrismaClient, input: ListParagraphsInput) {
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
      { name: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "newest" || sort === "createdAt_desc") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "oldest" || sort === "createdAt_asc") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "name_asc") {
    orderBy = { name: "asc" }
  } else if (sort === "name_desc") {
    orderBy = { name: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.paragraph.findMany({
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
    db.paragraph.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getParagraphById(db: PrismaClient, input: GetParagraphInput) {
  const paragraph = await db.paragraph.findUnique({
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

  if (!paragraph) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Paragraph with ID ${input.id} not found`,
    })
  }

  return paragraph
}

export async function createParagraph(db: PrismaClient, input: CreateParagraphInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveParagraphQuestionTypeId(db)

  return db.paragraph.create({
    data: {
      name: data.name,
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

export async function updateParagraph(db: PrismaClient, input: UpdateParagraphInput) {
  const { id, ...data } = input

  // Verify existence
  await getParagraphById(db, { id })
  const resolvedQuestionTypeId = await resolveParagraphQuestionTypeId(db)

  return db.paragraph.update({
    where: { id },
    data: {
      name: data.name,
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

export async function deleteParagraph(db: PrismaClient, input: DeleteParagraphInput) {
  await getParagraphById(db, { id: input.id })

  return db.paragraph.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteParagraphs(db: PrismaClient, input: BulkDeleteParagraphsInput) {
  const res = await db.paragraph.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importParagraphs(db: PrismaClient, input: ImportParagraphsInput) {
  const resolvedQuestionTypeId = await resolveParagraphQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const p of input.paragraphs) {
        const data = p

        const createdParagraph = await tx.paragraph.create({
          data: {
            name: data.name,
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

export async function getParagraphStats(db: PrismaClient, input: ParagraphStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId
  if (input.chapterId) where.chapterId = input.chapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.paragraph.count({ where }),
    db.paragraph.count({ where: { ...where, difficulty: "EASY" } }),
    db.paragraph.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.paragraph.count({ where: { ...where, difficulty: "HARD" } }),
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
