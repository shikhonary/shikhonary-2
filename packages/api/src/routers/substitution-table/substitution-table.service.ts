import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import type {
  CreateSubstitutionTableInput,
  DeleteSubstitutionTableInput,
  GetSubstitutionTableInput,
  ListSubstitutionTablesInput,
  UpdateSubstitutionTableInput,
  BulkDeleteSubstitutionTablesInput,
  ImportSubstitutionTablesInput,
  SubstitutionTableStatsInput,
} from "./substitution-table.schema"

// Helper function to resolve 'Substitution Table' question type ID
async function resolveSubstitutionTableQuestionTypeId(db: any) {
  const qt = await db.questionType.findFirst({
    where: {
      OR: [
        { nameEn: { equals: "Substitution Table", mode: "insensitive" } },
        { label: { equals: "Substitution Table", mode: "insensitive" } },
        { nameEn: { equals: "SUBSTITUTION_TABLE", mode: "insensitive" } },
        { nameBn: { contains: "প্রতিস্থাপন সারণি" } },
        { nameBn: { contains: "সাবস্টিটিউশন" } },
      ],
    },
    select: { id: true },
  })

  if (!qt) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Required 'Substitution Table' Question Type template was not found. Please create it under Question Types first.",
    })
  }

  return qt.id as string
}

export async function listSubstitutionTables(db: PrismaClient, input: ListSubstitutionTablesInput) {
  const { page, limit, query, subjectId, difficulty, sort } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}

  if (subjectId) where.subjectId = subjectId
  if (difficulty) where.difficulty = difficulty

  if (query) {
    where.OR = [
      { reference: { has: query } },
      { columnA: { has: query } },
      { columnB: { has: query } },
      { columnC: { has: query } },
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
    db.substitutionTable.findMany({
      where,
      orderBy,
      skip,
      take: resolvedLimit,
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
    db.substitutionTable.count({ where }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getSubstitutionTableById(db: PrismaClient, input: GetSubstitutionTableInput) {
  const item = await db.substitutionTable.findUnique({
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

  if (!item) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Substitution Table with ID ${input.id} not found`,
    })
  }

  return item
}

export async function createSubstitutionTable(db: PrismaClient, input: CreateSubstitutionTableInput) {
  const data = input
  const resolvedQuestionTypeId = await resolveSubstitutionTableQuestionTypeId(db)

  const created = await db.substitutionTable.create({
    data: {
      columnA: data.columnA ?? [],
      columnB: data.columnB ?? [],
      columnC: data.columnC ?? [],
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

  return created
}

export async function updateSubstitutionTable(db: PrismaClient, input: UpdateSubstitutionTableInput) {
  const { id, ...data } = input

  const existing = await db.substitutionTable.findUnique({
    where: { id },
  })

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Substitution Table with ID ${id} not found`,
    })
  }

  const updated = await db.substitutionTable.update({
    where: { id },
    data: {
      columnA: data.columnA !== undefined ? data.columnA : undefined,
      columnB: data.columnB !== undefined ? data.columnB : undefined,
      columnC: data.columnC !== undefined ? data.columnC : undefined,
      reference: data.reference !== undefined ? data.reference : undefined,
      difficulty: data.difficulty !== undefined ? data.difficulty : undefined,
      popularityCount: data.popularityCount !== undefined ? data.popularityCount : undefined,
      subjectId: data.subjectId !== undefined ? data.subjectId : undefined,
    },
    include: {
      subject: true,
      questionType: true,
    },
  })

  return updated
}

export async function deleteSubstitutionTable(db: PrismaClient, input: DeleteSubstitutionTableInput) {
  const existing = await db.substitutionTable.findUnique({
    where: { id: input.id },
  })

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Substitution Table with ID ${input.id} not found`,
    })
  }

  await db.substitutionTable.delete({
    where: { id: input.id },
  })

  return { success: true, id: input.id }
}

export async function bulkDeleteSubstitutionTables(db: PrismaClient, input: BulkDeleteSubstitutionTablesInput) {
  const res = await db.substitutionTable.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function importSubstitutionTables(db: PrismaClient, input: ImportSubstitutionTablesInput) {
  const resolvedQuestionTypeId = await resolveSubstitutionTableQuestionTypeId(db)

  const created = await db.$transaction(
    async (tx: any) => {
      const results = []
      for (const item of input.items) {
        const data = item

        const createdItem = await tx.substitutionTable.create({
          data: {
            columnA: data.columnA || [],
            columnB: data.columnB || [],
            columnC: data.columnC || [],
            reference: data.reference || [],
            difficulty: data.difficulty ?? "MEDIUM",
            popularityCount: data.popularityCount ?? 0,
            subjectId: data.subjectId,
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

export async function getSubstitutionTableStats(db: PrismaClient, input: SubstitutionTableStatsInput = {}) {
  const where: any = {}
  if (input.subjectId) where.subjectId = input.subjectId

  const [totalCount, easyCount, mediumCount, hardCount] = await Promise.all([
    db.substitutionTable.count({ where }),
    db.substitutionTable.count({ where: { ...where, difficulty: "EASY" } }),
    db.substitutionTable.count({ where: { ...where, difficulty: "MEDIUM" } }),
    db.substitutionTable.count({ where: { ...where, difficulty: "HARD" } }),
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
