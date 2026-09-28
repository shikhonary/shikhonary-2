import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateProseEssenceInput,
  DeleteProseEssenceInput,
  GetProseEssenceInput,
  ListProseEssenceInput,
  UpdateProseEssenceInput,
  BulkDeleteProseEssenceInput,
  ImportProseEssenceInput,
  ProseEssenceStatsInput,
} from "./prose-essence.schema"

async function resolveProseEssenceQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Prose Essence", mode: "insensitive" } },
        { label: { equals: "Prose Essence", mode: "insensitive" } },
        { nameEn: { equals: "PROSE_ESSENCE", mode: "insensitive" } },
        { nameBn: { equals: "গদ্য অনুচ্ছেদের মূলভাব", mode: "insensitive" } },
        { nameBn: { contains: "গদ্য অনুচ্ছেদের মূলভাব" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Prose Essence",
        nameBn: "গদ্য অনুচ্ছেদের মূলভাব",
        label: "Prose Essence",
        mark: 5,
        position: 23,
        descriptionEn: "Prose Essence",
        descriptionBn: "গদ্য অনুচ্ছেদের মূলভাব",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listProseEssence(db: PrismaClient, input: ListProseEssenceInput) {
  const { page, limit, query, subjectId, chapterId, academicChapterId, difficulty, source, session, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}
  const targetChapterId = academicChapterId || chapterId

  if (subjectId) where.subjectId = subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId
  if (difficulty) where.difficulty = difficulty
  if (source) where.source = source
  if (session) where.session = session

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { prosePassage: { contains: query, mode: "insensitive" } },
      { mainTheme: { contains: query, mode: "insensitive" } },
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
  } else if (sort === "title_asc") {
    orderBy = { title: "asc" }
  } else if (sort === "title_desc") {
    orderBy = { title: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.proseEssence.findMany({
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
    db.proseEssence.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getProseEssenceById(db: PrismaClient, input: GetProseEssenceInput) {
  const item = await db.proseEssence.findUnique({
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
      message: `Prose Essence entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createProseEssence(db: PrismaClient, input: CreateProseEssenceInput, userId?: string | null) {
  const data = input
  const resolvedQuestionTypeId = await resolveProseEssenceQuestionTypeId(db)
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  return db.proseEssence.create({
    data: {
      title: data.title,
      prosePassage: data.prosePassage || null,
      mainTheme: data.mainTheme || null,
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

export async function updateProseEssence(db: PrismaClient, input: UpdateProseEssenceInput, userId?: string | null) {
  const { id, ...data } = input

  await getProseEssenceById(db, { id })
  const resolvedQuestionTypeId = await resolveProseEssenceQuestionTypeId(db)
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    title: data.title,
    prosePassage: data.prosePassage !== undefined ? data.prosePassage : undefined,
    mainTheme: data.mainTheme !== undefined ? data.mainTheme : undefined,
    reference: data.reference,
    difficulty: data.difficulty,
    popularityCount: data.popularityCount,
    subjectId: data.subjectId,
    questionTypeId: resolvedQuestionTypeId,
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

  return db.proseEssence.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function deleteProseEssence(db: PrismaClient, input: DeleteProseEssenceInput) {
  await getProseEssenceById(db, { id: input.id })

  return db.proseEssence.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteProseEssence(db: PrismaClient, input: BulkDeleteProseEssenceInput) {
  const res = await db.proseEssence.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importProseEssence(db: PrismaClient, input: ImportProseEssenceInput, userId?: string | null) {
  const resolvedQuestionTypeId = await resolveProseEssenceQuestionTypeId(db)
  const currentYear = new Date().getFullYear().toString()

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.proseEssence.create({
          data: {
            title: data.title,
            prosePassage: data.prosePassage || null,
            mainTheme: data.mainTheme || null,
            reference: data.reference || [],
            source: data.source ? data.source.trim() : "গাইড বুক",
            session: currentYear,
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

export async function getProseEssenceStats(db: PrismaClient, input: ProseEssenceStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.proseEssence.count({ where }),
    db.proseEssence.count({ where: { ...where, difficulty: "EASY" } }),
    db.proseEssence.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.proseEssence.count({ where: { ...where, difficulty: "HARD" } }),
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
