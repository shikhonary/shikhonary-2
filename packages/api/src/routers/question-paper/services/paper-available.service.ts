import type { PrismaClient } from "@workspace/db/main"
import type { TenantPrismaClient } from "@workspace/db/tenant"
import { QUESTION_TYPES, QUESTION_TYPE_CODES, normalizeQuestionTypeName } from "@workspace/utils"
import type { GetAvailableQuestionsInput } from "../question-paper.schema"

export type CategoryQueryConfig = {
  model: string
  searchFields: string[]
  includes: Record<string, boolean>
  excludedIdField: string
  hasIsActive: boolean
  fallbackWithoutTypeFilter?: boolean
}

export const CATEGORY_QUERY_CONFIG: Record<string, CategoryQueryConfig> = {
  MCQ: {
    model: "mcq",
    searchFields: ["question"],
    includes: { chapter: true, questionType: true, attachments: true },
    excludedIdField: "mcqId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  CQ: {
    model: "cq",
    searchFields: ["questionA", "questionB", "questionC", "questionD", "context"],
    includes: { chapter: true, questionType: true, answer: true, attachments: true },
    excludedIdField: "cqId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  CS: {
    model: "cS",
    searchFields: ["questionA", "questionB", "questionC", "questionD", "context"],
    includes: { chapter: true, questionType: true },
    excludedIdField: "csId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  PBQ: {
    model: "pBQ",
    searchFields: ["questionA", "questionB", "questionC", "questionD", "questionE", "context"],
    includes: { academicChapter: true, questionType: true },
    excludedIdField: "pbqId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  SA: {
    model: "shortAnswer",
    searchFields: ["question"],
    includes: { chapter: true, questionType: true, attachments: true },
    excludedIdField: "shortAnswerId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  PARAGRAPH: {
    model: "paragraph",
    searchFields: ["name"],
    includes: { academicChapter: true, questionType: true },
    excludedIdField: "paragraphId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  AMPLIFICATION: {
    model: "amplification",
    searchFields: ["title"],
    includes: { academicChapter: true, questionType: true },
    excludedIdField: "amplificationId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  LETTER: {
    model: "letter",
    searchFields: ["title"],
    includes: { questionType: true },
    excludedIdField: "letterId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  APPLICATION: {
    model: "application",
    searchFields: ["title"],
    includes: { questionType: true },
    excludedIdField: "applicationId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  SUMMARY: {
    model: "summary",
    searchFields: ["title"],
    includes: { questionType: true },
    excludedIdField: "summaryId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  ESSENCE: {
    model: "essence",
    searchFields: ["title"],
    includes: { questionType: true },
    excludedIdField: "essenceId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  NEWS_REPORT: {
    model: "newsReport",
    searchFields: ["title"],
    includes: { questionType: true },
    excludedIdField: "newsReportId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  ESSAY: {
    model: "essay",
    searchFields: ["title"],
    includes: { questionType: true },
    excludedIdField: "essayId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  PARTS_OF_SPEECH: {
    model: "partsOfSpeech",
    searchFields: ["content"],
    includes: { academicChapter: true, questionType: true },
    excludedIdField: "partsOfSpeechId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  RIGHT_FORM_OF_VERBS: {
    model: "rightFormOfVerb",
    searchFields: ["content", "reference"],
    includes: { academicChapter: true, questionType: true },
    excludedIdField: "rightFormOfVerbId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  FILL_IN_THE_BLANKS_WITH_CLUES: {
    model: "fillInTheBlanksWithClues",
    searchFields: ["content"],
    includes: { academicChapter: true, questionType: true },
    excludedIdField: "fillInTheBlanksWithCluesId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  SUBSTITUTION_TABLE: {
    model: "substitutionTable",
    searchFields: ["columnA", "columnB", "columnC", "reference"],
    includes: { questionType: true, subject: true },
    excludedIdField: "substitutionTableId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  CHANGING_SENTENCES: {
    model: "changingSentence",
    searchFields: ["content", "reference"],
    includes: { questionType: true, subject: true },
    excludedIdField: "changingSentenceId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  PUNCTUATION: {
    model: "punctuation",
    searchFields: ["content", "reference"],
    includes: { questionType: true, subject: true },
    excludedIdField: "punctuationId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  SHORT_COMPOSITION: {
    model: "shortComposition",
    searchFields: ["title", "reference"],
    includes: { questionType: true, subject: true },
    excludedIdField: "shortCompositionId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
}

export const NORMALIZED_TO_CATEGORY: Record<string, string> = {
  [QUESTION_TYPES.MCQ]: "MCQ",
  [QUESTION_TYPES.CQ]: "CQ",
  [QUESTION_TYPES.CS]: "CS",
  [QUESTION_TYPES.SA]: "SA",
  [QUESTION_TYPES.PBQ]: "PBQ",
  [QUESTION_TYPES.PARAGRAPH]: "PARAGRAPH",
  [QUESTION_TYPES.THOUGHT_EXPANSION]: "AMPLIFICATION",
  [QUESTION_TYPES.LETTER]: "LETTER",
  [QUESTION_TYPES.APPLICATION]: "APPLICATION",
  [QUESTION_TYPES.SUMMARY]: "SUMMARY",
  [QUESTION_TYPES.ESSENCE]: "ESSENCE",
  [QUESTION_TYPES.NEWS_REPORT]: "NEWS_REPORT",
  [QUESTION_TYPES.ESSAY]: "ESSAY",
  [QUESTION_TYPES.PARTS_OF_SPEECH]: "PARTS_OF_SPEECH",
  [QUESTION_TYPES.RIGHT_FORM_OF_VERBS]: "RIGHT_FORM_OF_VERBS",
  [QUESTION_TYPES.CHANGING_SENTENCES]: "CHANGING_SENTENCES",
  [QUESTION_TYPES.FILL_IN_THE_BLANKS_WITH_CLUES]: "FILL_IN_THE_BLANKS_WITH_CLUES",
  [QUESTION_TYPES.SUBSTITUTION_TABLE]: "SUBSTITUTION_TABLE",
  [QUESTION_TYPES.PUNCTUATION]: "PUNCTUATION",
  [QUESTION_TYPES.SHORT_COMPOSITION]: "SHORT_COMPOSITION",
}

export async function getAvailableQuestions(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: GetAvailableQuestionsInput
) {
  const { subjectId, chapterId, questionTypeId, category, difficulty, search, board, excludePaperId, limit, cursor } = input

  // 1. Build exclusion set and resolve category in parallel
  const exclusionPromise = excludePaperId
    ? tenantDb.questionPaperQuestion.findMany({
      where: { questionPaperId: excludePaperId },
      select: {
        mcqId: true,
        cqId: true,
        csId: true,
        pbqId: true,
        shortAnswerId: true,
        paragraphId: true,
        amplificationId: true,
        letterId: true,
        applicationId: true,
        summaryId: true,
        essenceId: true,
        essayId: true,
        newsReportId: true,
        partsOfSpeechId: true,
        rightFormOfVerbId: true,
        changingSentenceId: true,
        fillInTheBlanksWithCluesId: true,
        substitutionTableId: true,
        punctuationId: true,
        shortCompositionId: true,
      },
    })
    : Promise.resolve([])

  const categoryPromise = (async () => {
    let effectiveCategory = category
    if ((!effectiveCategory || effectiveCategory === QUESTION_TYPE_CODES.MCQ) && questionTypeId && questionTypeId !== "all" && questionTypeId !== "All") {
      const qt = await db.questionType.findUnique({ where: { id: questionTypeId }, select: { nameEn: true, nameBn: true, label: true } })
      if (qt) {
        const norm = normalizeQuestionTypeName(qt.nameEn) || normalizeQuestionTypeName(qt.nameBn) || normalizeQuestionTypeName(qt.label)
        if (norm && NORMALIZED_TO_CATEGORY[norm]) {
          effectiveCategory = NORMALIZED_TO_CATEGORY[norm] as any
        }
      }
    }
    return effectiveCategory
  })()

  const [existingQuestions, resolvedCategory] = await Promise.all([exclusionPromise, categoryPromise])
  let effectiveCategory = resolvedCategory || "MCQ"

  // Build excluded IDs map by field
  const excludedIds = new Map<string, Set<string>>()
  for (const q of existingQuestions) {
    for (const [field, value] of Object.entries(q)) {
      if (value) {
        if (!excludedIds.has(field)) excludedIds.set(field, new Set())
        excludedIds.get(field)!.add(value as string)
      }
    }
  }

  // 2. Look up config for this category
  const config = CATEGORY_QUERY_CONFIG[effectiveCategory] || CATEGORY_QUERY_CONFIG.MCQ!

  // 3. Build common where clause
  const whereCommon: any = { subjectId, isGlobal: true, deletedAt: null }
  if (config.hasIsActive) whereCommon.isActive = true
  if (chapterId && chapterId !== "all" && chapterId !== "All") whereCommon.chapterId = chapterId
  if (difficulty && difficulty !== "all" && difficulty !== "All") whereCommon.difficulty = difficulty
  if (board && board !== "all" && board !== "All") {
    whereCommon.reference = { has: board }
  }

  const where: any = { ...whereCommon }

  if (["APPLICATION", "LETTER", "SUMMARY", "ESSENCE", "NEWS_REPORT", "ESSAY", "SUBSTITUTION_TABLE", "CHANGING_SENTENCES", "PUNCTUATION"].includes(effectiveCategory)) {
    delete where.chapterId
  }

  if (effectiveCategory === "PARAGRAPH" || effectiveCategory === "AMPLIFICATION" || effectiveCategory === "PBQ" || effectiveCategory === "PARTS_OF_SPEECH" || effectiveCategory === "FILL_IN_THE_BLANKS_WITH_CLUES") {
    if (chapterId && chapterId !== "all" && chapterId !== "All") {
      where.academicChapterId = chapterId
    }
    delete where.chapterId
  }

  if (effectiveCategory === "APPLICATION" || effectiveCategory === "LETTER") {
    if (questionTypeId && questionTypeId !== "all" && questionTypeId !== "All") {
      const matchWord = effectiveCategory === "APPLICATION" ? "app" : "letter"
      const matchWordBn = effectiveCategory === "APPLICATION" ? "আবেদন" : "পত্র"
      const altWordBn = effectiveCategory === "APPLICATION" ? "দরখাস্ত" : "চিঠি"
      const relatedQts = await db.questionType.findMany({
        where: {
          OR: [
            { nameEn: { contains: matchWord, mode: "insensitive" } },
            { nameBn: { contains: matchWordBn } },
            { nameBn: { contains: altWordBn } },
          ],
        },
        select: { id: true },
      })
      const relatedIds = relatedQts.map((q) => q.id)
      relatedIds.push(questionTypeId)
      where.questionTypeId = { in: Array.from(new Set(relatedIds)) }
    }
  } else if (questionTypeId && questionTypeId !== "all" && questionTypeId !== "All") {
    where.questionTypeId = questionTypeId
  }

  // 4. Build search filter
  if (search && search.trim()) {
    const trimmed = search.trim()
    if (config.searchFields.length === 1) {
      where[config.searchFields[0]!] = { contains: trimmed, mode: "insensitive" }
    } else {
      where.OR = config.searchFields.map((field) => ({
        [field]: { contains: trimmed, mode: "insensitive" },
      }))
    }
  }

  // 5. Execute query using the config model
  const model = (db as any)[config.model]
  let items = await model.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    include: config.includes,
    orderBy: { createdAt: "desc" },
  })

  // Fallback 1: retry without questionTypeId filter if no results
  if (items.length === 0 && (config.fallbackWithoutTypeFilter || where.questionTypeId) && where.questionTypeId) {
    delete where.questionTypeId
    items = await model.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: config.includes,
      orderBy: { createdAt: "desc" },
    })
  }

  // Fallback 2: retry without isActive filter if no results
  if (items.length === 0 && where.isActive !== undefined) {
    delete where.isActive
    items = await model.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: config.includes,
      orderBy: { createdAt: "desc" },
    })
  }

  // 6. Paginate and enrich with isAssigned flag
  const hasNext = items.length > limit
  const paginatedItems = hasNext ? items.slice(0, limit) : items
  const nextCursor = hasNext ? paginatedItems[paginatedItems.length - 1]?.id : undefined
  const excludedSet = excludedIds.get(config.excludedIdField) || new Set()

  return {
    category: effectiveCategory,
    items: paginatedItems.map((item: any) => ({
      ...item,
      chapter: item.academicChapter || item.chapter,
      chapterId: item.academicChapterId || item.chapterId,
      isAssigned: excludedSet.has(item.id),
    })),
    nextCursor,
  }
}
