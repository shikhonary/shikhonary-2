/**
 * Exam domain — business logic service.
 *
 * All database queries and core calculations live here.
 */
import type { PrismaClient } from "@workspace/db/main"
import { Prisma } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import { badRequest, notFound } from "../../utils/errors"
import type {
  AddExamSubjectsInput,
  BulkDeleteExamsInput,
  CreateExamInput,
  DeleteExamInput,
  ExamStatsInput,
  GetExamInput,
  ListExamsInput,
  RemoveExamSubjectInput,
  ToggleExamStatusInput,
  UpdateExamInput,
  UpdateExamSubjectMcqsInput,
  McqsForAssignmentInput,
} from "./exam.schema"
import { safeExamSelect } from "./exam.schema"

export type MappedExam = Omit<
  Prisma.ExamGetPayload<{ select: typeof safeExamSelect }>,
  "academicClass"
> & {
  academicClass: {
    id: string
    name: string
    isActive: boolean
    nameEn: string
    nameBn: string
  } | null
}

// Helper to map database Exam record to the legacy shape expected by client applications.
export function mapExamResponse(
  exam: Prisma.ExamGetPayload<{ select: typeof safeExamSelect }>
): MappedExam {
  return {
    id: exam.id,
    title: exam.title,
    total: exam.total,
    duration: exam.duration,
    totalMcq: exam.totalMcq,
    startDate: exam.startDate,
    endDate: exam.endDate,
    hasSuffle: exam.hasSuffle,
    hasRandom: exam.hasRandom,
    hasNegativeMark: exam.hasNegativeMark,
    negativeMark: exam.negativeMark,
    isOffline: exam.isOffline,
    type: exam.type,
    status: exam.status,
    academicClassId: exam.academicClassId,
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt,
    examSubjects: exam.examSubjects,
    examGroupItems: exam.examGroupItems,
    _count: exam._count,
    academicClass: exam.academicClass ? {
      id: exam.academicClass.id,
      name: exam.academicClass.name,
      isActive: exam.academicClass.isActive,
      nameEn: exam.academicClass.name,
      nameBn: exam.academicClass.name,
    } : null,
  }
}

export function mapExamResponseNullable(
  exam: Prisma.ExamGetPayload<{ select: typeof safeExamSelect }> | null
): MappedExam | null {
  if (!exam) return null
  return mapExamResponse(exam)
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listExams(db: PrismaClient, input: ListExamsInput) {
  const where = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.academicClassId ? { academicClassId: input.academicClassId } : {}),
    ...(input.isOffline !== undefined ? { isOffline: input.isOffline } : {}),
    ...(input.examGroupId
      ? { examGroupItems: { some: { examGroupId: input.examGroupId } } }
      : {}),
    ...(input.query
      ? {
          OR: [
            { title: { contains: input.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  let orderBy: any = [{ createdAt: "desc" }]
  switch (input.sort) {
    case "oldest":
      orderBy = [{ createdAt: "asc" }]
      break
    case "title_asc":
      orderBy = [{ title: "asc" }]
      break
    case "title_desc":
      orderBy = [{ title: "desc" }]
      break
    case "newest":
    case "All":
    default:
      orderBy = [{ createdAt: "desc" }]
      break
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [items, totalItems] = await Promise.all([
    db.exam.findMany({
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      where,
      select: safeExamSelect,
      orderBy,
    }),
    db.exam.count({ where }),
  ])

  const nextCursor =
    items.length === limit ? items[items.length - 1]?.id : undefined

  return {
    items: items.map(mapExamResponse),
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
    nextCursor,
  }
}

export async function getExamById(db: PrismaClient, input: GetExamInput): Promise<MappedExam> {
  const item = await db.exam.findUnique({
    where: { id: input.id },
    select: safeExamSelect,
  })

  if (!item) throw notFound("Exam")
  return mapExamResponse(item)
}

export async function getExamStats(db: PrismaClient, input?: ExamStatsInput) {
  const where = {
    ...(input?.status ? { status: input?.status } : {}),
    ...(input?.type ? { type: input?.type } : {}),
    ...(input?.academicClassId ? { academicClassId: input?.academicClassId } : {}),
    ...(input?.isOffline !== undefined ? { isOffline: input?.isOffline } : {}),
  }

  const [totalCount, statusGroup, typeGroup] = await Promise.all([
    db.exam.count({ where }),
    db.exam.groupBy({
      by: ["status"],
      where,
      _count: { id: true },
    }),
    db.exam.groupBy({
      by: ["type"],
      where,
      _count: { id: true },
    }),
  ])

  const statusCounts = statusGroup.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = item._count.id
    return acc
  }, {})

  const typeCounts = typeGroup.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = item._count.id
    return acc
  }, {})

  return {
    totalCount,
    statusCounts,
    typeCounts,
  }
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createExam(db: PrismaClient, input: CreateExamInput) {
  try {
    const { subjectIds, academicClassId, examGroupId, ...examData } = input

    // Validate date range
    if (examData.endDate <= examData.startDate) {
      throw badRequest("End date must be after start date")
    }

    // Validate academic class exists
    const academicClass = await db.academicClass.findUnique({
      where: { id: academicClassId },
      select: { id: true },
    })
    if (!academicClass) {
      throw badRequest("Academic class ID is invalid")
    }

    // Validate all subjects exist
    const subjects = await db.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true },
    })

    if (subjects.length !== subjectIds.length) {
      throw badRequest("One or more subject IDs are invalid")
    }

    // If examGroupId is provided, validate it exists
    if (examGroupId) {
      const examGroup = await db.examGroup.findUnique({
        where: { id: examGroupId },
        select: { id: true },
      })
      if (!examGroup) {
        throw badRequest("Exam Group ID is invalid")
      }
    }

    // Create exam + subject links + examGroup link in a transaction
    const exam = await db.$transaction(async (tx) => {
      const created = await tx.exam.create({
        data: {
          ...examData,
          academicClassId,
        },
        select: { id: true },
      })

      await tx.examSubject.createMany({
        data: subjectIds.map((subjectId) => ({
          examId: created.id,
          subjectId,
        })),
      })

      if (examGroupId) {
        await tx.examGroupItem.create({
          data: {
            examGroupId,
            examId: created.id,
            position: 0,
            weightage: 100.0,
            isRequired: true,
          },
        })
      }

      return tx.exam.findUniqueOrThrow({
        where: { id: created.id },
        select: safeExamSelect,
      })
    })

    return exam
  } catch (err: any) {
    if (err instanceof TRPCError) throw err
    console.error("[createExam] Error:", err)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: err?.message || "Failed to create exam",
    })
  }
}

export async function updateExam(db: PrismaClient, input: UpdateExamInput) {
  const { id, academicClassId, examGroupId, ...data } = input

  const existing = await db.exam.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw notFound("Exam")

  if (academicClassId) {
    const academicClass = await db.academicClass.findUnique({
      where: { id: academicClassId },
      select: { id: true },
    })
    if (!academicClass) throw badRequest("Academic class ID is invalid")
  }

  if (data.startDate && data.endDate && data.endDate <= data.startDate) {
    throw badRequest("End date must be after start date")
  }

  if (examGroupId !== undefined) {
    // If examGroupId is provided, link or update
    if (examGroupId === null || examGroupId === "none" || examGroupId === "") {
      // Remove all group items for this exam
      await db.examGroupItem.deleteMany({
        where: { examId: id },
      })
    } else {
      const groupExists = await db.examGroup.findUnique({
        where: { id: examGroupId },
        select: { id: true },
      })
      if (!groupExists) throw badRequest("Exam Group ID is invalid")

      // Upsert the exam group item link
      await db.examGroupItem.upsert({
        where: {
          examGroupId_examId: {
            examGroupId,
            examId: id,
          },
        },
        create: {
          examGroupId,
          examId: id,
          position: 0,
          weightage: 100.0,
          isRequired: true,
        },
        update: {},
      })
    }
  }

  return db.exam.update({
    where: { id },
    data: {
      ...data,
      ...(academicClassId ? { academicClassId } : {}),
    },
    select: safeExamSelect,
  })
}

export async function deleteExam(db: PrismaClient, input: DeleteExamInput) {
  const existing = await db.exam.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("Exam")

  await db.exam.delete({
    where: { id: input.id },
  })

  return { success: true }
}

export async function bulkDeleteExams(
  db: PrismaClient,
  input: BulkDeleteExamsInput,
) {
  await db.exam.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })

  return { success: true, count: input.ids.length }
}

export async function toggleExamStatus(
  db: PrismaClient,
  input: ToggleExamStatusInput,
) {
  const existing = await db.exam.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("Exam")

  return db.exam.update({
    where: { id: input.id },
    data: { status: input.status },
    select: safeExamSelect,
  })
}

export async function addExamSubjects(
  db: PrismaClient,
  input: AddExamSubjectsInput,
) {
  const { examId, subjectIds } = input

  const exam = await db.exam.findUnique({
    where: { id: examId },
    select: { id: true },
  })
  if (!exam) throw notFound("Exam")

  const subjects = await db.subject.findMany({
    where: { id: { in: subjectIds } },
    select: { id: true },
  })
  if (subjects.length !== subjectIds.length) {
    throw badRequest("One or more subject IDs are invalid")
  }

  await db.examSubject.createMany({
    data: subjectIds.map((subjectId) => ({
      examId,
      subjectId,
    })),
    skipDuplicates: true,
  })

  return db.exam.findUniqueOrThrow({
    where: { id: examId },
    select: safeExamSelect,
  })
}

export async function removeExamSubject(
  db: PrismaClient,
  input: RemoveExamSubjectInput,
) {
  const { examId, subjectId } = input

  await db.examSubject.deleteMany({
    where: {
      examId,
      subjectId,
    },
  })

  return db.exam.findUniqueOrThrow({
    where: { id: examId },
    select: safeExamSelect,
  })
}

export async function updateExamSubjectMcqs(
  db: PrismaClient,
  input: UpdateExamSubjectMcqsInput,
) {
  const { examId, examSubjectId, mcqIds } = input

  const examSubject = await db.examSubject.findFirst({
    where: { id: examSubjectId, examId },
  })
  if (!examSubject) throw notFound("Exam Subject")

  await db.examSubject.update({
    where: { id: examSubjectId },
    data: { mcqIds },
  })

  return db.exam.findUniqueOrThrow({
    where: { id: examId },
    select: safeExamSelect,
  })
}

export async function getMcqsForAssignment(
  db: PrismaClient,
  input: McqsForAssignmentInput,
) {
  const { examId, subjectId, chapterId, board, query, type, assignedStatus, limit, page } = input

  // Fetch the ExamSubject join record to get list of assigned MCQs
  const examSubject = await db.examSubject.findFirst({
    where: { examId, subjectId },
    select: { mcqIds: true },
  })

  const assignedMcqIds = examSubject?.mcqIds ?? []

  // Build prisma where clause
  const whereClause: any = {
    subjectId,
  }

  // Handle chapter filter
  if (chapterId && chapterId !== "All") {
    whereClause.chapterId = chapterId
  }

  // Handle board filter
  if (board && board !== "All") {
    whereClause.reference = {
      hasSome: [board],
    }
  }

  // Handle Assigned Status filter
  if (assignedStatus === "Assigned") {
    whereClause.id = { in: assignedMcqIds }
  } else if (assignedStatus === "Unassigned") {
    whereClause.id = { notIn: assignedMcqIds }
  }

  // Handle type filter
  if (type && type !== "All") {
    whereClause.type = type
  }

  // Handle search query
  if (query && query.trim() !== "") {
    const q = query.trim()
    whereClause.OR = [
      { question: { contains: q, mode: "insensitive" } },
      { context: { contains: q, mode: "insensitive" } },
    ]
  }

  // Pagination skip & take
  const skip = (page - 1) * limit
  const take = limit

  const [items, totalItems] = await Promise.all([
    db.mcq.findMany({
      where: whereClause,
      select: {
        id: true,
        question: true,
        answer: true,
        options: true,
        statements: true,
        type: true,
        isMath: true,
        reference: true,
        explanation: true,
        questionUrl: true,
        context: true,
        contextUrl: true,
        subjectId: true,
        chapterId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        chapter: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    db.mcq.count({
      where: whereClause,
    }),
  ])

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    page,
    limit,
  }
}
