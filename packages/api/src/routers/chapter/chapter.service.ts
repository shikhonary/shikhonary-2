/**
 * Chapter domain — business logic service.
 *
 * All database queries live here, decoupled from tRPC plumbing.
 */
import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import { notFound } from "../../utils/errors"
import type {
  ChapterForSelectionInput,
  ChapterStatsInput,
  CreateChapterInput,
  DeleteChapterInput,
  GetChapterInput,
  ListChaptersInput,
  ReorderChaptersInput,
  UpdateChapterInput,
} from "./chapter.schema"
import { safeChapterSelect } from "./chapter.schema"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listChapters(
  db: PrismaClient,
  input: ListChaptersInput,
) {
  const where = {
    ...(input.subjectId ? { subjectId: input.subjectId } : {}),
    ...(input.query
      ? {
          OR: [
            { name: { contains: input.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  let orderBy: any = [{ position: "asc" }, { createdAt: "desc" }]
  switch (input.sort) {
    case "position_desc":
      orderBy = [{ position: "desc" }, { createdAt: "desc" }]
      break
    case "name_asc":
      orderBy = [{ name: "asc" }]
      break
    case "name_desc":
      orderBy = [{ name: "desc" }]
      break
    case "newest":
      orderBy = [{ createdAt: "desc" }]
      break
    case "oldest":
      orderBy = [{ createdAt: "asc" }]
      break
    case "position_asc":
    case "All":
    default:
      orderBy = [{ position: "asc" }, { createdAt: "desc" }]
      break
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 10
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [items, totalItems] = await Promise.all([
    db.chapter.findMany({
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      where,
      select: safeChapterSelect,
      orderBy,
    }),
    db.chapter.count({ where }),
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

export async function getChapterStats(
  db: PrismaClient,
  input?: ChapterStatsInput,
) {
  const where = input?.subjectId ? { subjectId: input.subjectId } : {}

  const [totalChaptersCount, subjectsGroup] = await Promise.all([
    db.chapter.count({ where }),
    db.chapter.groupBy({
      by: ["subjectId"],
      where,
    }),
  ])

  return {
    totalChaptersCount,
    activeSubjectsCount: subjectsGroup.length,
  }
}

export async function getChapterById(
  db: PrismaClient,
  input: GetChapterInput,
) {
  const item = await db.chapter.findUnique({
    where: { id: input.id },
    select: safeChapterSelect,
  })

  if (!item) throw notFound("Chapter")
  return item
}

export async function getChaptersForSelection(
  db: PrismaClient,
  input: ChapterForSelectionInput,
) {
  return db.chapter.findMany({
    where: {
      ...(input.subjectId ? { subjectId: input.subjectId } : {}),
    },
    select: {
      id: true,
      name: true,
      position: true,
      subjectId: true,
    },
    orderBy: { position: "asc" },
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createChapter(
  db: PrismaClient,
  input: CreateChapterInput,
) {
  try {
    const subject = await db.subject.findUnique({
      where: { id: input.subjectId },
      select: { id: true },
    })
    if (!subject) throw notFound("Subject")

    return await db.chapter.create({
      data: input,
      select: safeChapterSelect,
    })
  } catch (err: any) {
    if (err instanceof TRPCError) throw err
    console.error("[createChapter] Error:", err)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: err?.message || "Failed to create chapter",
    })
  }
}

export async function updateChapter(
  db: PrismaClient,
  input: UpdateChapterInput,
) {
  const { id, subjectId, ...data } = input

  const existing = await db.chapter.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw notFound("Chapter")

  if (subjectId) {
    const subject = await db.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    })
    if (!subject) throw notFound("Subject")
  }

  return db.chapter.update({
    where: { id },
    data: {
      ...data,
      ...(subjectId ? { subjectId } : {}),
    },
    select: safeChapterSelect,
  })
}

export async function deleteChapter(
  db: PrismaClient,
  input: DeleteChapterInput,
) {
  const existing = await db.chapter.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("Chapter")

  await db.chapter.delete({
    where: { id: input.id },
  })

  return { success: true }
}

export async function reorderChapters(
  db: PrismaClient,
  input: ReorderChaptersInput,
) {
  const { subjectId, chapterIds } = input

  const subject = await db.subject.findUnique({
    where: { id: subjectId },
    select: { id: true },
  })
  if (!subject) throw notFound("Subject")

  const updates = chapterIds.map((id, index) =>
    db.chapter.updateMany({
      where: { id, subjectId },
      data: { position: index },
    }),
  )

  await db.$transaction(updates)

  return { success: true }
}
