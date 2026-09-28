import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreatePodNirnoyInput,
  DeletePodNirnoyInput,
  GetPodNirnoyInput,
  ListPodNirnoyInput,
  UpdatePodNirnoyInput,
  BulkDeletePodNirnoyInput,
  ImportPodNirnoyInput,
  PodNirnoyStatsInput,
} from "./pod-nirnoy.schema"

async function resolvePodNirnoyQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Pod Nirnoy", mode: "insensitive" } },
        { label: { equals: "Pod Nirnoy", mode: "insensitive" } },
        { nameEn: { equals: "POD_NIRNOY", mode: "insensitive" } },
        { nameBn: { equals: "পদ নির্ণয়", mode: "insensitive" } },
        { nameBn: { contains: "পদ নির্ণয়" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Pod Nirnoy",
        nameBn: "পদ নির্ণয়",
        label: "Pod Nirnoy",
        mark: 5,
        position: 27,
        descriptionEn: "Pod Nirnoy",
        descriptionBn: "পদ নির্ণয়",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listPodNirnoy(db: PrismaClient, input: ListPodNirnoyInput) {
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
      { content: { contains: query, mode: "insensitive" } },
      { word: { contains: query, mode: "insensitive" } },
      { source: { contains: query, mode: "insensitive" } },
      { session: { contains: query, mode: "insensitive" } },
      { words: { has: query } },
      { reference: { has: query } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "newest" || sort === "createdAt_desc") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "oldest" || sort === "createdAt_asc") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "content_asc") {
    orderBy = { content: "asc" }
  } else if (sort === "content_desc") {
    orderBy = { content: "desc" }
  } else if (sort === "word_asc") {
    orderBy = { word: "asc" }
  } else if (sort === "word_desc") {
    orderBy = { word: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.podNirnoy.findMany({
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
    db.podNirnoy.count({ where }),
  ])

  return {
    items: items.map((item) => ({
      ...item,
      chapter: item.academicChapter,
      chapterId: item.academicChapterId,
    })),
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getPodNirnoyById(db: PrismaClient, input: GetPodNirnoyInput) {
  const item = await db.podNirnoy.findUnique({
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
      message: `Pod Nirnoy entry with ID ${input.id} not found`,
    })
  }

  return {
    ...item,
    chapter: item.academicChapter,
    chapterId: item.academicChapterId,
  }
}

export async function createPodNirnoy(db: PrismaClient, input: CreatePodNirnoyInput, userId?: string | null) {
  const data = input
  const resolvedQuestionTypeId = await resolvePodNirnoyQuestionTypeId(db)
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  const resolvedWord = data.word ? data.word.trim() : null
  const resolvedWords = data.words && data.words.length > 0
    ? data.words
    : resolvedWord ? [resolvedWord] : []

  const created = await db.podNirnoy.create({
    data: {
      content: data.content ? data.content.trim() : null,
      word: resolvedWord,
      words: resolvedWords,
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

  return {
    ...created,
    chapter: created.academicChapter,
    chapterId: created.academicChapterId,
  }
}

export async function updatePodNirnoy(db: PrismaClient, input: UpdatePodNirnoyInput, userId?: string | null) {
  const { id, ...data } = input

  await getPodNirnoyById(db, { id })
  const resolvedQuestionTypeId = await resolvePodNirnoyQuestionTypeId(db)
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    content: data.content !== undefined ? (data.content ? data.content.trim() : null) : undefined,
    word: data.word !== undefined ? (data.word ? data.word.trim() : null) : undefined,
    words: data.words,
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

  const updated = await db.podNirnoy.update({
    where: { id },
    data: updateData,
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

export async function deletePodNirnoy(db: PrismaClient, input: DeletePodNirnoyInput) {
  await getPodNirnoyById(db, { id: input.id })

  return db.podNirnoy.delete({
    where: { id: input.id },
  })
}

export async function bulkDeletePodNirnoy(db: PrismaClient, input: BulkDeletePodNirnoyInput) {
  const res = await db.podNirnoy.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importPodNirnoy(db: PrismaClient, input: ImportPodNirnoyInput, userId?: string | null) {
  const resolvedQuestionTypeId = await resolvePodNirnoyQuestionTypeId(db)
  const currentYear = new Date().getFullYear().toString()

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const resolvedWord = data.word ? data.word.trim() : null
        const resolvedWords = data.words && data.words.length > 0
          ? data.words
          : resolvedWord ? [resolvedWord] : []

        const createdItem = await tx.podNirnoy.create({
          data: {
            content: data.content ? data.content.trim() : null,
            word: resolvedWord,
            words: resolvedWords,
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

export async function getPodNirnoyStats(db: PrismaClient, input: PodNirnoyStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.podNirnoy.count({ where }),
    db.podNirnoy.count({ where: { ...where, difficulty: "EASY" } }),
    db.podNirnoy.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.podNirnoy.count({ where: { ...where, difficulty: "HARD" } }),
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
