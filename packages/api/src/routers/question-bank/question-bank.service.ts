/**
 * Question Bank domain — business logic service.
 *
 * All database queries live here, decoupled from tRPC plumbing.
 * The question bank is read-only — it only exposes active MCQs
 * for browsing, searching, and filtering purposes.
 */
import type { PrismaClient } from "@workspace/db/main"
import { notFound } from "../../utils/errors"
import type {
  GetQuestionBankMcqInput,
  ListQuestionBankInput,
  QuestionBankBoardYearsInput,
  QuestionBankByChapterInput,
  QuestionBankStatsInput,
} from "./question-bank.schema"
import { safeQuestionBankMcqSelect } from "./question-bank.schema"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * List active MCQs with pagination and optional filters.
 * Only returns MCQs where isActive = true.
 */
export async function listQuestionBankMcqs(
  db: PrismaClient,
  input: ListQuestionBankInput,
) {
  const where = {
    // Question bank always scopes to active MCQs only
    isActive: true,
    ...(input.subjectId ? { subjectId: input.subjectId } : {}),
    ...(input.chapterId ? { chapterId: input.chapterId } : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.isMath !== undefined ? { isMath: input.isMath } : {}),
    ...(input.query
      ? {
          OR: [
            {
              question: {
                contains: input.query,
                mode: "insensitive" as const,
              },
            },
            {
              explanation: {
                contains: input.query,
                mode: "insensitive" as const,
              },
            },
            {
              context: {
                contains: input.query,
                mode: "insensitive" as const,
              },
            },
            {
              reference: {
                hasSome: [input.query],
              },
            },
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
      select: safeQuestionBankMcqSelect,
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

/**
 * Get aggregate statistics for active MCQs in the question bank.
 * Optionally scoped to a subject or chapter.
 */
export async function getQuestionBankStats(
  db: PrismaClient,
  input?: QuestionBankStatsInput,
) {
  const baseWhere = {
    isActive: true,
    ...(input?.subjectId ? { subjectId: input.subjectId } : {}),
    ...(input?.chapterId ? { chapterId: input.chapterId } : {}),
  }

  const [totalCount, mathCount, typesGroup, subjectGroup] = await Promise.all([
    db.mcq.count({ where: baseWhere }),
    db.mcq.count({ where: { ...baseWhere, isMath: true } }),
    db.mcq.groupBy({
      by: ["type"],
      where: baseWhere,
      _count: { id: true },
    }),
    db.mcq.groupBy({
      by: ["subjectId"],
      where: baseWhere,
      _count: { id: true },
    }),
  ])

  const typeCounts = typesGroup.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = item._count.id
    return acc
  }, {})

  const subjectCounts = subjectGroup.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.subjectId] = item._count.id
      return acc
    },
    {},
  )

  return {
    totalCount,
    mathCount,
    nonMathCount: totalCount - mathCount,
    typeCounts,
    subjectCounts,
  }
}

/**
 * Get a single active MCQ by ID (full detail including subject + chapter).
 */
export async function getQuestionBankMcqById(
  db: PrismaClient,
  input: GetQuestionBankMcqInput,
) {
  const item = await db.mcq.findUnique({
    where: { id: input.id, isActive: true },
    select: safeQuestionBankMcqSelect,
  })

  if (!item) throw notFound("MCQ")
  return item
}

/**
 * Get MCQ counts grouped by chapter for a given subject.
 * Useful for the chapter drill-down sidebar in the question bank.
 */
export async function getQuestionBankByChapter(
  db: PrismaClient,
  input: QuestionBankByChapterInput,
) {
  // Fetch ALL chapters belonging to the subject
  const chapters = await db.chapter.findMany({
    where: {
      subjectId: input.subjectId,
    },
    select: {
      id: true,
      name: true,
      position: true,
    },
    orderBy: { position: "asc" },
  })

  // Aggregate active MCQ counts grouped by chapter
  const chapterCounts = await db.mcq.groupBy({
    by: ["chapterId"],
    where: {
      subjectId: input.subjectId,
      isActive: true,
    },
    _count: { id: true },
  })

  const countMap = chapterCounts.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.chapterId] = item._count.id
      return acc
    },
    {},
  )

  return chapters.map((chapter) => ({
    ...chapter,
    mcqCount: countMap[chapter.id] ?? 0,
  }))
}

/**
 * Get organized Board + Year combinations for a subject (and optional chapter).
 */
export async function getQuestionBankBoardYears(
  db: PrismaClient,
  input: QuestionBankBoardYearsInput,
) {
  const mcqs = await db.mcq.findMany({
    where: {
      subjectId: input.subjectId,
      ...(input.chapterId ? { chapterId: input.chapterId } : {}),
      isActive: true,
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

  mcqs.forEach((m) => {
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
