import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateVerbTenseInput,
  DeleteVerbTenseInput,
  GetVerbTenseInput,
  ListVerbTenseInput,
  UpdateVerbTenseInput,
  BulkDeleteVerbTenseInput,
  ImportVerbTenseInput,
  VerbTenseStatsInput,
} from "./verb-tense.schema"

async function resolveVerbTenseQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Verb Tense", mode: "insensitive" } },
        { label: { equals: "Verb Tense", mode: "insensitive" } },
        { nameEn: { equals: "VERB_TENSE", mode: "insensitive" } },
        { nameBn: { equals: "ক্রিয়াপদের রূপ", mode: "insensitive" } },
        { nameBn: { contains: "ক্রিয়াপদ" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Verb Tense",
        nameBn: "ক্রিয়াপদের রূপ",
        label: "Verb Tense",
        mark: 5,
        position: 28,
        descriptionEn: "Verb Tense",
        descriptionBn: "ক্রিয়াপদের অতীত, বর্তমান ও ভবিষ্যৎ রূপ",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listVerbTense(db: PrismaClient, input: ListVerbTenseInput) {
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
      { verb: { contains: query, mode: "insensitive" } },
      { presentForm: { contains: query, mode: "insensitive" } },
      { pastForm: { contains: query, mode: "insensitive" } },
      { futureForm: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
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
  } else if (sort === "verb_asc") {
    orderBy = { verb: "asc" }
  } else if (sort === "verb_desc") {
    orderBy = { verb: "desc" }
  } else if (sort === "popularity" || sort === "popularity_desc") {
    orderBy = { popularityCount: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.verbTense.findMany({
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
    db.verbTense.count({ where }),
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

export async function getVerbTenseById(db: PrismaClient, input: GetVerbTenseInput) {
  const item = await db.verbTense.findUnique({
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
      message: `Verb Tense entry with ID ${input.id} not found`,
    })
  }

  return {
    ...item,
    chapter: item.academicChapter,
    chapterId: item.academicChapterId,
  }
}

export async function createVerbTense(db: PrismaClient, input: CreateVerbTenseInput, userId?: string | null) {
  const data = input
  const resolvedQuestionTypeId = await resolveVerbTenseQuestionTypeId(db)
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  const created = await db.verbTense.create({
    data: {
      verb: data.verb,
      presentForm: data.presentForm || null,
      pastForm: data.pastForm || null,
      futureForm: data.futureForm || null,
      content: data.content || null,
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

export async function updateVerbTense(db: PrismaClient, input: UpdateVerbTenseInput, userId?: string | null) {
  const { id, ...data } = input

  await getVerbTenseById(db, { id })
  const resolvedQuestionTypeId = await resolveVerbTenseQuestionTypeId(db)
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    verb: data.verb,
    presentForm: data.presentForm !== undefined ? data.presentForm : undefined,
    pastForm: data.pastForm !== undefined ? data.pastForm : undefined,
    futureForm: data.futureForm !== undefined ? data.futureForm : undefined,
    content: data.content !== undefined ? data.content : undefined,
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

  const updated = await db.verbTense.update({
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

export async function deleteVerbTense(db: PrismaClient, input: DeleteVerbTenseInput) {
  await getVerbTenseById(db, { id: input.id })

  return db.verbTense.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteVerbTense(db: PrismaClient, input: BulkDeleteVerbTenseInput) {
  const res = await db.verbTense.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importVerbTense(db: PrismaClient, input: ImportVerbTenseInput, userId?: string | null) {
  const resolvedQuestionTypeId = await resolveVerbTenseQuestionTypeId(db)
  const currentYear = new Date().getFullYear().toString()

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.verbTense.create({
          data: {
            verb: data.verb,
            presentForm: data.presentForm || null,
            pastForm: data.pastForm || null,
            futureForm: data.futureForm || null,
            content: data.content || null,
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

export async function getVerbTenseStats(db: PrismaClient, input: VerbTenseStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.verbTense.count({ where }),
    db.verbTense.count({ where: { ...where, difficulty: "EASY" } }),
    db.verbTense.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.verbTense.count({ where: { ...where, difficulty: "HARD" } }),
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
