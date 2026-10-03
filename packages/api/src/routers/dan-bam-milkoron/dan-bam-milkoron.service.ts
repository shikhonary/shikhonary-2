import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateDanBamMilkoronInput,
  DeleteDanBamMilkoronInput,
  GetDanBamMilkoronInput,
  ListDanBamMilkoronInput,
  UpdateDanBamMilkoronInput,
  BulkDeleteDanBamMilkoronInput,
  ImportDanBamMilkoronInput,
  DanBamMilkoronStatsInput,
} from "./dan-bam-milkoron.schema"

async function resolveDanBamMilkoronQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Dan Bam Milkoron", mode: "insensitive" } },
        { label: { equals: "Dan Bam Milkoron", mode: "insensitive" } },
        { nameEn: { equals: "DAN_BAM_MILKORON", mode: "insensitive" } },
        { nameEn: { equals: "Matching Table", mode: "insensitive" } },
        { nameEn: { equals: "Matching Columns", mode: "insensitive" } },
        { nameBn: { equals: "ডান-বাম মিলকরণ", mode: "insensitive" } },
        { nameBn: { contains: "মিলকরণ" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    qt = await db.questionType.create({
      data: {
        nameEn: "Dan Bam Milkoron",
        nameBn: "ডান-বাম মিলকরণ",
        label: "Dan Bam Milkoron",
        mark: 5,
        position: 24,
        descriptionEn: "Matching left and right columns",
        descriptionBn: "ডান পাশ ও বাম পাশ মিলকরণ",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listDanBamMilkoron(db: PrismaClient, input: ListDanBamMilkoronInput) {
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
      { leftColumn: { has: query } },
      { rightColumn: { has: query } },
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
    db.danBamMilkoron.findMany({
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
    db.danBamMilkoron.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getDanBamMilkoronById(db: PrismaClient, input: GetDanBamMilkoronInput) {
  const item = await db.danBamMilkoron.findUnique({
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
      message: `Dan Bam Milkoron entry with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createDanBamMilkoron(
  db: PrismaClient,
  input: CreateDanBamMilkoronInput,
  userId?: string | null
) {
  const data = input
  const resolvedQuestionTypeId = await resolveDanBamMilkoronQuestionTypeId(db)
  const targetChapterId = data.academicChapterId || data.chapterId || null
  const currentYear = new Date().getFullYear().toString()

  return db.danBamMilkoron.create({
    data: {
      leftColumn: data.leftColumn ?? [],
      rightColumn: data.rightColumn ?? [],
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

export async function updateDanBamMilkoron(
  db: PrismaClient,
  input: UpdateDanBamMilkoronInput,
  userId?: string | null
) {
  const { id, ...data } = input

  await getDanBamMilkoronById(db, { id })
  const resolvedQuestionTypeId = await resolveDanBamMilkoronQuestionTypeId(db)
  const targetChapterId = data.academicChapterId !== undefined ? data.academicChapterId : data.chapterId
  const currentYear = new Date().getFullYear().toString()

  const updateData: any = {
    leftColumn: data.leftColumn,
    rightColumn: data.rightColumn,
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

  return db.danBamMilkoron.update({
    where: { id },
    data: updateData,
    include: {
      subject: true,
      academicChapter: true,
      questionType: true,
    },
  })
}

export async function deleteDanBamMilkoron(db: PrismaClient, input: DeleteDanBamMilkoronInput) {
  await getDanBamMilkoronById(db, { id: input.id })

  return db.danBamMilkoron.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteDanBamMilkoron(db: PrismaClient, input: BulkDeleteDanBamMilkoronInput) {
  const res = await db.danBamMilkoron.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importDanBamMilkoron(
  db: PrismaClient,
  input: ImportDanBamMilkoronInput,
  userId?: string | null
) {
  const resolvedQuestionTypeId = await resolveDanBamMilkoronQuestionTypeId(db)
  const currentYear = new Date().getFullYear().toString()

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const q of input.questions) {
        const data = q
        const targetChapterId = data.academicChapterId || data.chapterId || null

        const createdItem = await tx.danBamMilkoron.create({
          data: {
            leftColumn: data.leftColumn || [],
            rightColumn: data.rightColumn || [],
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

export async function getDanBamMilkoronStats(db: PrismaClient, input: DanBamMilkoronStatsInput = {}) {
  const where: any = {}
  const targetChapterId = input.academicChapterId || input.chapterId

  if (input.subjectId) where.subjectId = input.subjectId
  if (targetChapterId) where.academicChapterId = targetChapterId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.danBamMilkoron.count({ where }),
    db.danBamMilkoron.count({ where: { ...where, difficulty: "EASY" } }),
    db.danBamMilkoron.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.danBamMilkoron.count({ where: { ...where, difficulty: "HARD" } }),
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
