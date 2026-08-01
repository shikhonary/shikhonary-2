/**
 * MCQ domain — business logic service.
 *
 * All database queries live here, decoupled from tRPC plumbing.
 */
import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import { badRequest, notFound } from "../../utils/errors"
import type {
  BulkDeleteMcqsInput,
  CreateMcqInput,
  DeleteMcqInput,
  GetMcqInput,
  ImportMcqsInput,
  ListMcqsInput,
  McqStatsInput,
  ToggleMcqActiveInput,
  UpdateMcqInput,
} from "./mcq.schema"
import { safeMcqSelect } from "./mcq.schema"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listMcqs(db: PrismaClient, input: ListMcqsInput) {
  const where = {
    ...(input.subjectId ? { subjectId: input.subjectId } : {}),
    ...(input.chapterId ? { chapterId: input.chapterId } : {}),
    ...(input.board && input.board !== "All"
      ? {
          reference: {
            hasSome: [input.board],
          },
        }
      : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.isMath !== undefined ? { isMath: input.isMath } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    ...(input.query
      ? {
          OR: [
            { question: { contains: input.query, mode: "insensitive" as const } },
            { explanation: { contains: input.query, mode: "insensitive" as const } },
            { context: { contains: input.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  let orderBy: any = [{ createdAt: "desc" }]
  switch (input.sort) {
    case "oldest":
      orderBy = [{ createdAt: "asc" }]
      break
    case "question_asc":
      orderBy = [{ question: "asc" }]
      break
    case "question_desc":
      orderBy = [{ question: "desc" }]
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
    db.mcq.findMany({
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      where,
      select: safeMcqSelect,
      orderBy,
    }),
    db.mcq.count({ where }),
  ])

  const nextCursor =
    items.length === limit ? items[items.length - 1]?.id : undefined

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
    nextCursor,
  }
}

export async function getMcqStats(db: PrismaClient, input?: McqStatsInput) {
  const where = {
    ...(input?.subjectId ? { subjectId: input.subjectId } : {}),
    ...(input?.chapterId ? { chapterId: input.chapterId } : {}),
  }

  const [totalCount, activeCount, mathCount, typesGroup] = await Promise.all([
    db.mcq.count({ where }),
    db.mcq.count({ where: { ...where, isActive: true } }),
    db.mcq.count({ where: { ...where, isMath: true } }),
    db.mcq.groupBy({
      by: ["type"],
      where,
      _count: { id: true },
    }),
  ])

  const typeCounts = typesGroup.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = item._count.id
    return acc
  }, {})

  return {
    totalCount,
    activeCount,
    inactiveCount: totalCount - activeCount,
    mathCount,
    typeCounts,
  }
}

export async function getMcqById(db: PrismaClient, input: GetMcqInput) {
  const item = await db.mcq.findUnique({
    where: { id: input.id },
    select: safeMcqSelect,
  })

  if (!item) throw notFound("MCQ")
  return item
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createMcq(db: PrismaClient, input: CreateMcqInput) {
  try {
    const subject = await db.subject.findUnique({
      where: { id: input.subjectId },
      select: { id: true },
    })
    if (!subject) throw notFound("Subject")

    const chapter = await db.chapter.findUnique({
      where: { id: input.chapterId },
      select: { id: true, subjectId: true },
    })
    if (!chapter) throw notFound("Chapter")

    if (chapter.subjectId !== input.subjectId) {
      throw badRequest("Chapter does not belong to the specified subject")
    }

    return await db.mcq.create({
      data: input,
      select: safeMcqSelect,
    })
  } catch (err: any) {
    if (err instanceof TRPCError) throw err
    console.error("[createMcq] Error:", err)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: err?.message || "Failed to create MCQ",
    })
  }
}

export async function updateMcq(db: PrismaClient, input: UpdateMcqInput) {
  const { id, subjectId, chapterId, ...data } = input

  const existing = await db.mcq.findUnique({
    where: { id },
    select: { id: true, subjectId: true, chapterId: true },
  })
  if (!existing) throw notFound("MCQ")

  const targetSubjectId = subjectId ?? existing.subjectId
  const targetChapterId = chapterId ?? existing.chapterId

  if (subjectId) {
    const subject = await db.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    })
    if (!subject) throw notFound("Subject")
  }

  if (chapterId) {
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, subjectId: true },
    })
    if (!chapter) throw notFound("Chapter")

    if (chapter.subjectId !== targetSubjectId) {
      throw badRequest("Chapter does not belong to the specified subject")
    }
  }

  return db.mcq.update({
    where: { id },
    data: {
      ...data,
      ...(subjectId ? { subjectId } : {}),
      ...(chapterId ? { chapterId } : {}),
    },
    select: safeMcqSelect,
  })
}

export async function deleteMcq(db: PrismaClient, input: DeleteMcqInput) {
  const existing = await db.mcq.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("MCQ")

  await db.mcq.delete({
    where: { id: input.id },
  })

  return { success: true }
}

export async function bulkDeleteMcqs(
  db: PrismaClient,
  input: BulkDeleteMcqsInput,
) {
  const result = await db.mcq.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })

  return {
    success: true,
    deletedCount: result.count,
  }
}

export async function toggleMcqActive(
  db: PrismaClient,
  input: ToggleMcqActiveInput,
) {
  const existing = await db.mcq.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("MCQ")

  return db.mcq.update({
    where: { id: input.id },
    data: {
      isActive: input.isActive,
    },
    select: safeMcqSelect,
  })
}

export async function importMcqs(
  db: PrismaClient,
  input: ImportMcqsInput,
) {
  try {
    const created = await db.$transaction(
      input.mcqs.map((mcq) =>
        db.mcq.create({
          data: mcq,
          select: { id: true },
        })
      )
    )

    return {
      success: true,
      importedCount: created.length,
    }
  } catch (err: any) {
    if (err instanceof TRPCError) throw err
    console.error("[importMcqs] Error:", err)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: err?.message || "Failed to bulk import MCQs",
    })
  }
}

