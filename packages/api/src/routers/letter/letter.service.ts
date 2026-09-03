import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateLetterInput,
  DeleteLetterInput,
  GetLetterInput,
  ListLettersInput,
  UpdateLetterInput,
  BulkDeleteLettersInput,
  ImportLettersInput,
  LetterStatsInput,
} from "./letter.schema"

// Helper function to resolve 'Letter' question type ID
async function resolveLetterQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Letter", mode: "insensitive" } },
        { label: { equals: "Letter", mode: "insensitive" } },
        { nameEn: { equals: "Letter Writing", mode: "insensitive" } },
        { label: { equals: "Letter Writing", mode: "insensitive" } },
        { nameEn: { equals: "Informal Letter", mode: "insensitive" } },
        { label: { equals: "Informal Letter", mode: "insensitive" } },
        { nameBn: { equals: "চিঠি", mode: "insensitive" } },
        { nameBn: { equals: "চিঠি লিখন", mode: "insensitive" } },
        { nameBn: { equals: "পত্র লিখন", mode: "insensitive" } },
        { label: { equals: "চিঠি", mode: "insensitive" } },
        { label: { equals: "পত্র লিখন", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Letter",
        nameBn: "চিঠি",
        label: "Letter",
        mark: 10,
        position: 9,
        descriptionEn: "Informal / Formal Letter Writing",
        descriptionBn: "চিঠি / পত্র লিখন",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listLetters(db: PrismaClient, input: ListLettersInput) {
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
    db.letter.findMany({
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
    db.letter.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getLetterById(db: PrismaClient, input: GetLetterInput) {
  const letter = await db.letter.findUnique({
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

  if (!letter) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Letter with ID ${input.id} not found`,
    })
  }

  return letter
}

export async function createLetter(db: PrismaClient, input: CreateLetterInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveLetterQuestionTypeId(db)

  return db.letter.create({
    data: {
      title: data.title,
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

export async function updateLetter(db: PrismaClient, input: UpdateLetterInput) {
  const { id, ...data } = input

  // Verify existence
  await getLetterById(db, { id })
  const resolvedQuestionTypeId = await resolveLetterQuestionTypeId(db)

  return db.letter.update({
    where: { id },
    data: {
      title: data.title,
      reference: data.reference,
      difficulty: data.difficulty,
      popularityCount: data.popularityCount,
      subjectId: data.subjectId,
      questionTypeId: resolvedQuestionTypeId,
    },
    include: {
      subject: true,
      questionType: true,
    },
  })
}

export async function deleteLetter(db: PrismaClient, input: DeleteLetterInput) {
  await getLetterById(db, { id: input.id })

  return db.letter.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteLetters(db: PrismaClient, input: BulkDeleteLettersInput) {
  const res = await db.letter.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importLetters(db: PrismaClient, input: ImportLettersInput) {
  const resolvedQuestionTypeId = await resolveLetterQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const l of input.letters) {
        const data = l

        const createdLetter = await tx.letter.create({
          data: {
            title: data.title,
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            questionTypeId: resolvedQuestionTypeId,
          },
        })
        results.push(createdLetter)
      }
      return results
    },
    {
      timeout: 30000,
    }
  )

  return { importedCount: created.length }
}

export async function getLetterStats(db: PrismaClient, input: LetterStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.letter.count({ where }),
    db.letter.count({ where: { ...where, difficulty: "EASY" } }),
    db.letter.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.letter.count({ where: { ...where, difficulty: "HARD" } }),
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
