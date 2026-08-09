/**
 * CQ (Creative Question) domain — business logic service.
 *
 * All database queries live here, decoupled from tRPC plumbing.
 */
import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import { badRequest, notFound } from "../../utils/errors"
import type {
  BulkDeleteCqsInput,
  CreateCqInput,
  DeleteCqInput,
  GetCqInput,
  ListCqsInput,
  UpdateCqInput,
  ImportCqsInput,
  CqBoardYearsInput,
} from "./cq.schema"
import { safeCqSelect } from "./cq.schema"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listCqs(db: PrismaClient, input: ListCqsInput) {
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
    ...(input.query
      ? {
          OR: [
            { questionA: { contains: input.query, mode: "insensitive" as const } },
            { questionB: { contains: input.query, mode: "insensitive" as const } },
            { questionC: { contains: input.query, mode: "insensitive" as const } },
            { questionD: { contains: input.query, mode: "insensitive" as const } },
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
      orderBy = [{ questionA: "asc" }]
      break
    case "question_desc":
      orderBy = [{ questionA: "desc" }]
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
    db.cq.findMany({
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      where,
      select: safeCqSelect,
      orderBy,
    }),
    db.cq.count({ where }),
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

export async function getCqById(db: PrismaClient, input: GetCqInput) {
  const item = await db.cq.findUnique({
    where: { id: input.id },
    select: safeCqSelect,
  })

  if (!item) throw notFound("CQ")
  return item
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createCq(db: PrismaClient, input: CreateCqInput) {
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

    const { attachments, answer, ...cqData } = input

    return await db.cq.create({
      data: {
        ...cqData,
        attachments: {
          create: attachments.map((att) => ({
            url: att.url,
            type: att.type,
            caption: att.caption,
            position: att.position,
          })),
        },
        answer: answer
          ? {
              create: {
                answerA: answer.answerA,
                answerB: answer.answerB,
                answerC: answer.answerC,
                answerD: answer.answerD,
                explanation: answer.explanation,
              },
            }
          : undefined,
      },
      select: safeCqSelect,
    })
  } catch (err: any) {
    if (err instanceof TRPCError) throw err
    console.error("[createCq] Error:", err)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: err?.message || "Failed to create CQ",
    })
  }
}

export async function updateCq(db: PrismaClient, input: UpdateCqInput) {
  const { id, subjectId, chapterId, attachments, answer, ...cqData } = input

  const existing = await db.cq.findUnique({
    where: { id },
    select: { id: true, subjectId: true, chapterId: true },
  })
  if (!existing) throw notFound("CQ")

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

  return await db.$transaction(async (tx) => {
    // Recreate attachments if provided
    if (attachments !== undefined) {
      await tx.cqAttachment.deleteMany({
        where: { cqId: id },
      })
      if (attachments.length > 0) {
        await tx.cqAttachment.createMany({
          data: attachments.map((att) => ({
            cqId: id,
            url: att.url,
            type: att.type,
            caption: att.caption,
            position: att.position,
          })),
        })
      }
    }

    // Upsert answer if provided
    if (answer !== undefined) {
      if (answer === null) {
        await tx.cqAnswer.deleteMany({
          where: { cqId: id },
        })
      } else {
        await tx.cqAnswer.upsert({
          where: { cqId: id },
          create: {
            cqId: id,
            answerA: answer.answerA,
            answerB: answer.answerB,
            answerC: answer.answerC,
            answerD: answer.answerD,
            explanation: answer.explanation,
          },
          update: {
            answerA: answer.answerA,
            answerB: answer.answerB,
            answerC: answer.answerC,
            answerD: answer.answerD,
            explanation: answer.explanation,
          },
        })
      }
    }

    // Update main CQ
    return await tx.cq.update({
      where: { id },
      data: {
        ...cqData,
        ...(subjectId ? { subjectId } : {}),
        ...(chapterId ? { chapterId } : {}),
      },
      select: safeCqSelect,
    })
  })
}

export async function deleteCq(db: PrismaClient, input: DeleteCqInput) {
  const existing = await db.cq.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("CQ")

  await db.cq.delete({
    where: { id: input.id },
  })

  return { success: true }
}

export async function bulkDeleteCqs(
  db: PrismaClient,
  input: BulkDeleteCqsInput,
) {
  const result = await db.cq.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })

  return {
    success: true,
    deletedCount: result.count,
  }
}

export async function importCqs(
  db: PrismaClient,
  input: ImportCqsInput,
) {
  try {
    const created = await db.$transaction(
      input.cqs.map((cq) => {
        const { attachments, answer, ...cqData } = cq
        return db.cq.create({
          data: {
            ...cqData,
            attachments: {
              create: attachments.map((att) => ({
                url: att.url,
                type: att.type,
                caption: att.caption,
                position: att.position,
              })),
            },
            answer: answer
              ? {
                  create: {
                    answerA: answer.answerA,
                    answerB: answer.answerB,
                    answerC: answer.answerC,
                    answerD: answer.answerD,
                    explanation: answer.explanation,
                  },
                }
              : undefined,
          },
          select: { id: true },
        })
      })
    )

    return {
      success: true,
      importedCount: created.length,
    }
  } catch (err: any) {
    if (err instanceof TRPCError) throw err
    console.error("[importCqs] Error:", err)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: err?.message || "Failed to bulk import CQs",
    })
  }
}

export async function getCqBoardYears(
  db: PrismaClient,
  input: CqBoardYearsInput,
) {
  const cqs = await db.cq.findMany({
    where: {
      subjectId: input.subjectId,
      ...(input.chapterId ? { chapterId: input.chapterId } : {}),
    },
    select: { reference: true },
  })

  const boardMap: Record<string, string> = {
    "ঢা.বো.": "ঢাকা বোর্ড",
    "রা.বো.": "রাজশাহী বোর্ড",
    "য.বো.": "যশোর বোর্ড",
    "চ.বো.": "চট্টগ্রাম বোর্ড",
    "সি.বো.": "সিলেট বোর্ড",
    "ব.বো.": "বরিশাল বোর্ড",
    "দি.বো.": "দিনাজপুর বোর্ড",
    "কু.বো.": "কুমিল্লা বোর্ড",
    "ম.বো.": "ময়মনসিংহ বোর্ড",
  }

  const boardYearRegex = /(ঢা\.বো\.|রা\.বো\.|য\.বো\.|চ\.বো\.|সি\.বো\.|ব\.বো\.|দি\.বো\.|কু\.বো\.|ম\.বো\.)\s*([০-৯0-9]{2,4})/

  const boardYearCounts: Record<
    string,
    { rawRef: string; boardKey: string; boardName: string; year: string; count: number }
  > = {}

  cqs.forEach((m) => {
    const refs = m.reference || []
    refs.forEach((ref) => {
      const match = ref.match(boardYearRegex)
      if (match) {
        const boardKey = match[1]!
        const year = match[2]!
        const boardName = boardMap[boardKey] || boardKey
        const fullKey = `${boardKey} ${year}`

        if (!boardYearCounts[fullKey]) {
          boardYearCounts[fullKey] = {
            rawRef: fullKey,
            boardKey,
            boardName,
            year,
            count: 0,
          }
        }
        boardYearCounts[fullKey].count += 1
      }
    })
  })

  return Object.values(boardYearCounts).sort((a, b) =>
    a.boardName.localeCompare(b.boardName) || b.year.localeCompare(a.year)
  )
}
