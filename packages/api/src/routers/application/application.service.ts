import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateApplicationInput,
  DeleteApplicationInput,
  GetApplicationInput,
  ListApplicationsInput,
  UpdateApplicationInput,
  BulkDeleteApplicationsInput,
  ImportApplicationsInput,
  ApplicationStatsInput,
} from "./application.schema"

// Helper function to resolve 'Application' question type ID
async function resolveApplicationQuestionTypeId(db: any) {
  let qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Application", mode: "insensitive" } },
        { label: { equals: "Application", mode: "insensitive" } },
        { nameEn: { equals: "Formal Letter", mode: "insensitive" } },
        { label: { equals: "Formal Letter", mode: "insensitive" } },
        { nameBn: { equals: "আবেদনপত্র", mode: "insensitive" } },
        { label: { equals: "আবেদনপত্র", mode: "insensitive" } },
        { nameBn: { equals: "দরখাস্ত", mode: "insensitive" } },
        { label: { equals: "দরখাস্ত", mode: "insensitive" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    // Auto-create standard Application QuestionType so imports and creations never fail
    qt = await db.questionType.create({
      data: {
        nameEn: "Application",
        nameBn: "আবেদনপত্র",
        label: "Application",
        mark: 10,
        position: 10,
        descriptionEn: "Formal Application / Official Request Writing",
        descriptionBn: "আবেদনপত্র / দরখাস্ত লিখন",
        isActive: true,
      },
      select: { id: true },
    })
  }

  return qt.id as string
}

export async function listApplications(db: PrismaClient, input: ListApplicationsInput) {
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
    db.application.findMany({
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
    db.application.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getApplicationById(db: PrismaClient, input: GetApplicationInput) {
  const application = await db.application.findUnique({
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

  if (!application) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Application with ID ${input.id} not found`,
    })
  }

  return application
}

export async function createApplication(db: PrismaClient, input: CreateApplicationInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveApplicationQuestionTypeId(db)

  return db.application.create({
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

export async function updateApplication(db: PrismaClient, input: UpdateApplicationInput) {
  const { id, ...data } = input

  // Verify existence
  await getApplicationById(db, { id })
  const resolvedQuestionTypeId = await resolveApplicationQuestionTypeId(db)

  return db.application.update({
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

export async function deleteApplication(db: PrismaClient, input: DeleteApplicationInput) {
  await getApplicationById(db, { id: input.id })

  return db.application.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteApplications(db: PrismaClient, input: BulkDeleteApplicationsInput) {
  const res = await db.application.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importApplications(db: PrismaClient, input: ImportApplicationsInput) {
  const resolvedQuestionTypeId = await resolveApplicationQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx) => {
      const results = []
      for (const a of input.applications) {
        const data = a

        const createdApplication = await tx.application.create({
          data: {
            title: data.title,
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
            questionTypeId: resolvedQuestionTypeId,
          },
        })
        results.push(createdApplication)
      }
      return results
    },
    {
      timeout: 30000,
    }
  )

  return { importedCount: created.length }
}

export async function getApplicationStats(db: PrismaClient, input: ApplicationStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.application.count({ where }),
    db.application.count({ where: { ...where, difficulty: "EASY" } }),
    db.application.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.application.count({ where: { ...where, difficulty: "HARD" } }),
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
