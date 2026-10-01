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
  POEM_ESSENCE: {
    model: "poemEssence",
    searchFields: ["title", "poemStanza", "mainTheme"],
    includes: { academicChapter: true, questionType: true },
    excludedIdField: "poemEssenceId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  PROSE_ESSENCE: {
    model: "proseEssence",
    searchFields: ["title", "prosePassage", "mainTheme"],
    includes: { academicChapter: true, questionType: true },
    excludedIdField: "proseEssenceId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  POEM: {
    model: "poem",
    searchFields: ["title", "reference"],
    includes: { questionType: true },
    excludedIdField: "poemId",
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
  WORD_MEANING: {
    model: "wordMeaning",
    searchFields: ["word", "meaning"],
    includes: { academicChapter: true, questionType: true },
    excludedIdField: "wordMeaningId",
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
  FILL_IN_THE_BLANKS_WITHOUT_CLUES: {
    model: "fillInTheBlanksWithoutClues",
    searchFields: ["content", "clue", "reference"],
    includes: { academicChapter: true, questionType: true },
    excludedIdField: "fillInTheBlanksWithoutCluesId",
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
  DESCRIPTIVE_QUESTION: {
    model: "descriptiveQuestion",
    searchFields: ["question", "answer", "reference"],
    includes: { questionType: true, subject: true, chapter: true },
    excludedIdField: "descriptiveQuestionId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  SHORT_QUESTION: {
    model: "shortQuestion",
    searchFields: ["question", "reference"],
    includes: { questionType: true, subject: true, chapter: true },
    excludedIdField: "shortQuestionId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  MAKE_SENTENCES: {
    model: "makeSentences",
    searchFields: ["word", "reference"],
    includes: { questionType: true, subject: true, academicChapter: true },
    excludedIdField: "makeSentencesId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  MAKE_QUESTION: {
    model: "makeQuestion",
    searchFields: ["statement", "clue", "answer", "context", "reference"],
    includes: { questionType: true, subject: true, academicChapter: true },
    excludedIdField: "makeQuestionId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  OPPOSITE_WORD: {
    model: "oppositeWord",
    searchFields: ["word", "oppositeWord", "oppositeWords", "reference"],
    includes: { questionType: true, subject: true, academicChapter: true },
    excludedIdField: "oppositeWordId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  JUKTOBORNO: {
    model: "juktoborno",
    searchFields: ["juktoborno", "source", "reference"],
    includes: { questionType: true, subject: true, academicChapter: true },
    excludedIdField: "juktobornoId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  EK_KOTHAY_PROKASH: {
    model: "ekKothayProkash",
    searchFields: ["phrase", "oneWord", "source", "reference"],
    includes: { questionType: true, subject: true, academicChapter: true },
    excludedIdField: "ekKothayProkashId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  SYNONYM: {
    model: "synonym",
    searchFields: ["word", "synonymWord", "synonyms", "reference"],
    includes: { questionType: true, subject: true, academicChapter: true },
    excludedIdField: "synonymId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  SADHU_TO_CHOLITO: {
    model: "sadhuToCholito",
    searchFields: ["sadhuText", "cholitoText", "alternativeTexts", "reference"],
    includes: { questionType: true, subject: true, academicChapter: true },
    excludedIdField: "sadhuToCholitoId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  POD_NIRNOY: {
    model: "podNirnoy",
    searchFields: ["content", "words", "reference"],
    includes: { questionType: true, subject: true, academicChapter: true },
    excludedIdField: "podNirnoyId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  VERB_TENSE: {
    model: "verbTense",
    searchFields: ["verb", "presentForm", "pastForm", "futureForm", "content", "reference"],
    includes: { questionType: true, subject: true, academicChapter: true },
    excludedIdField: "verbTenseId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  FORM_FILLUP: {
    model: "formFillup",
    searchFields: ["scenario", "institution", "title", "description", "declaration", "reference"],
    includes: { questionType: true, subject: true, academicChapter: true },
    excludedIdField: "formFillupId",
    hasIsActive: true,
    fallbackWithoutTypeFilter: true,
  },
  FORM_FILLING: {
    model: "formFillup",
    searchFields: ["scenario", "institution", "title", "description", "declaration", "reference"],
    includes: { questionType: true, subject: true, academicChapter: true },
    excludedIdField: "formFillupId",
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
  [QUESTION_TYPES.POEM_ESSENCE]: "POEM_ESSENCE",
  [QUESTION_TYPES.PROSE_ESSENCE]: "PROSE_ESSENCE",
  [QUESTION_TYPES.POEM]: "POEM",
  [QUESTION_TYPES.DESCRIPTIVE_QUESTION]: "DESCRIPTIVE_QUESTION",
  [QUESTION_TYPES.SHORT_QUESTION]: "SHORT_QUESTION",
  [QUESTION_TYPES.NEWS_REPORT]: "NEWS_REPORT",
  [QUESTION_TYPES.ESSAY]: "ESSAY",
  [QUESTION_TYPES.PARTS_OF_SPEECH]: "PARTS_OF_SPEECH",
  [QUESTION_TYPES.RIGHT_FORM_OF_VERBS]: "RIGHT_FORM_OF_VERBS",
  [QUESTION_TYPES.CHANGING_SENTENCES]: "CHANGING_SENTENCES",
  [QUESTION_TYPES.FILL_IN_THE_BLANKS_WITH_CLUES]: "FILL_IN_THE_BLANKS_WITH_CLUES",
  [QUESTION_TYPES.FILL_IN_THE_BLANKS_WITHOUT_CLUES]: "FILL_IN_THE_BLANKS_WITHOUT_CLUES",
  [QUESTION_TYPES.SUBSTITUTION_TABLE]: "SUBSTITUTION_TABLE",
  [QUESTION_TYPES.PUNCTUATION]: "PUNCTUATION",
  [QUESTION_TYPES.SHORT_COMPOSITION]: "SHORT_COMPOSITION",
  [QUESTION_TYPES.MAKE_QUESTION]: "MAKE_QUESTION",
  [QUESTION_TYPES.MAKE_SENTENCES]: "MAKE_SENTENCES",
  [QUESTION_TYPES.WORD_MEANING]: "WORD_MEANING",
  [QUESTION_TYPES.OPPOSITE_WORD]: "OPPOSITE_WORD",
  [QUESTION_TYPES.JUKTOBORNO]: "JUKTOBORNO",
  [QUESTION_TYPES.EK_KOTHAY_PROKASH]: "EK_KOTHAY_PROKASH",
  [QUESTION_TYPES.SYNONYM]: "SYNONYM",
  [QUESTION_TYPES.SADHU_TO_CHOLITO]: "SADHU_TO_CHOLITO",
  [QUESTION_TYPES.POD_NIRNOY]: "POD_NIRNOY",
  [QUESTION_TYPES.VERB_TENSE]: "VERB_TENSE",
  [QUESTION_TYPES.FORM_FILLUP]: "FORM_FILLUP",
  [QUESTION_TYPES.FORM_FILLING]: "FORM_FILLUP",
}

export async function getAvailableQuestions(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: GetAvailableQuestionsInput
) {
  const { subjectId, chapterId, questionTypeId, category, difficulty, search, board, source, excludePaperId, page, limit, cursor } = input

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
        poemEssenceId: true,
        proseEssenceId: true,
        poemId: true,
        essayId: true,
        newsReportId: true,
        partsOfSpeechId: true,
        rightFormOfVerbId: true,
        changingSentenceId: true,
        fillInTheBlanksWithCluesId: true,
        fillInTheBlanksWithoutCluesId: true,
        substitutionTableId: true,
        punctuationId: true,
        shortCompositionId: true,
        descriptiveQuestionId: true,
        shortQuestionId: true,
        makeQuestionId: true,
        wordMeaningId: true,
        makeSentencesId: true,
        oppositeWordId: true,
        juktobornoId: true,
        ekKothayProkashId: true,
        synonymId: true,
        sadhuToCholitoId: true,
        podNirnoyId: true,
        verbTenseId: true,
        formFillupId: true,
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
  if (source && source !== "all" && source !== "All") {
    whereCommon.source = source
  }

  const where: any = { ...whereCommon }

  if (["APPLICATION", "LETTER", "SUMMARY", "ESSENCE", "POEM", "NEWS_REPORT", "ESSAY", "SUBSTITUTION_TABLE", "CHANGING_SENTENCES", "PUNCTUATION"].includes(effectiveCategory)) {
    delete where.chapterId
  }

  if (
    effectiveCategory === "PARAGRAPH" ||
    effectiveCategory === "AMPLIFICATION" ||
    effectiveCategory === "PBQ" ||
    effectiveCategory === "PARTS_OF_SPEECH" ||
    effectiveCategory === "FILL_IN_THE_BLANKS_WITH_CLUES" ||
    effectiveCategory === "FILL_IN_THE_BLANKS_WITHOUT_CLUES" ||
    effectiveCategory === "WORD_MEANING" ||
    effectiveCategory === "MAKE_SENTENCES" ||
    effectiveCategory === "OPPOSITE_WORD" ||
    effectiveCategory === "JUKTOBORNO" ||
    effectiveCategory === "EK_KOTHAY_PROKASH" ||
    effectiveCategory === "SYNONYM" ||
    effectiveCategory === "SADHU_TO_CHOLITO" ||
    effectiveCategory === "POD_NIRNOY" ||
    effectiveCategory === "VERB_TENSE" ||
    effectiveCategory === "FORM_FILLUP" ||
    effectiveCategory === "FORM_FILLING" ||
    effectiveCategory === "POEM_ESSENCE" ||
    effectiveCategory === "PROSE_ESSENCE" ||
    effectiveCategory === "SHORT_QUESTION" ||
    effectiveCategory === "MAKE_QUESTION" ||
    effectiveCategory === "DESCRIPTIVE_QUESTION"
  ) {
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
  const resolvedPage = page && page > 0 ? page : 1
  const resolvedLimit = limit && limit > 0 ? limit : 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const model = (db as any)[config.model]

  let totalItems = 0
  try {
    totalItems = await model.count({ where })
  } catch {
    totalItems = 0
  }

  let items = await model.findMany({
    where,
    skip,
    take: resolvedLimit,
    include: config.includes,
    orderBy: { createdAt: "desc" },
  })

  // Fallback 1: retry without questionTypeId filter if no results
  if (items.length === 0 && (config.fallbackWithoutTypeFilter || where.questionTypeId) && where.questionTypeId) {
    delete where.questionTypeId
    try {
      totalItems = await model.count({ where })
    } catch {
      totalItems = 0
    }
    items = await model.findMany({
      where,
      skip,
      take: resolvedLimit,
      include: config.includes,
      orderBy: { createdAt: "desc" },
    })
  }

  // Fallback 2: retry without isActive filter if no results
  if (items.length === 0 && where.isActive !== undefined) {
    delete where.isActive
    try {
      totalItems = await model.count({ where })
    } catch {
      totalItems = 0
    }
    items = await model.findMany({
      where,
      skip,
      take: resolvedLimit,
      include: config.includes,
      orderBy: { createdAt: "desc" },
    })
  }

  // 6. Enrich with isAssigned flag and return pagination metadata
  const excludedSet = excludedIds.get(config.excludedIdField) || new Set()
  const totalPages = Math.max(1, Math.ceil(totalItems / resolvedLimit))

  return {
    category: effectiveCategory,
    items: items.map((item: any) => ({
      ...item,
      chapter: item.academicChapter || item.chapter,
      chapterId: item.academicChapterId || item.chapterId,
      isAssigned: excludedSet.has(item.id),
    })),
    totalItems,
    page: resolvedPage,
    limit: resolvedLimit,
    totalPages,
    hasNextPage: resolvedPage < totalPages,
    hasPrevPage: resolvedPage > 1,
  }
}

export async function getAvailableBoardYears(
  db: PrismaClient,
  input: {
    subjectId: string
    chapterId?: string
    questionTypeId?: string
    category?: string
  }
) {
  let effectiveCategory = input.category || "MCQ"
  if ((!effectiveCategory || effectiveCategory === QUESTION_TYPE_CODES.MCQ) && input.questionTypeId && input.questionTypeId !== "all" && input.questionTypeId !== "All") {
    const qt = await db.questionType.findUnique({ where: { id: input.questionTypeId }, select: { nameEn: true, nameBn: true, label: true } })
    if (qt) {
      const norm = normalizeQuestionTypeName(qt.nameEn) || normalizeQuestionTypeName(qt.nameBn) || normalizeQuestionTypeName(qt.label)
      if (norm && NORMALIZED_TO_CATEGORY[norm]) {
        effectiveCategory = NORMALIZED_TO_CATEGORY[norm] as any
      }
    }
  }

  const config = CATEGORY_QUERY_CONFIG[effectiveCategory] || CATEGORY_QUERY_CONFIG.MCQ!
  const modelName = config.model

  const where: any = {
    subjectId: input.subjectId,
    deletedAt: null,
    isGlobal: true,
  }
  if (config.hasIsActive) {
    where.isActive = true
  }

  if (input.chapterId && input.chapterId !== "all" && input.chapterId !== "All") {
    if (["PARAGRAPH", "AMPLIFICATION", "PBQ", "PARTS_OF_SPEECH", "FILL_IN_THE_BLANKS_WITH_CLUES", "FILL_IN_THE_BLANKS_WITHOUT_CLUES", "WORD_MEANING", "MAKE_SENTENCES", "MAKE_QUESTION", "OPPOSITE_WORD", "SYNONYM", "SADHU_TO_CHOLITO", "POD_NIRNOY", "VERB_TENSE", "POEM_ESSENCE", "PROSE_ESSENCE", "SHORT_QUESTION", "DESCRIPTIVE_QUESTION"].includes(effectiveCategory)) {
      where.academicChapterId = input.chapterId
    } else if (!["APPLICATION", "LETTER", "SUMMARY", "ESSENCE", "NEWS_REPORT", "ESSAY", "SUBSTITUTION_TABLE", "CHANGING_SENTENCES", "PUNCTUATION"].includes(effectiveCategory)) {
      where.chapterId = input.chapterId
    }
  }

  const modelDelegate = (db as any)[modelName]
  if (!modelDelegate) return []

  try {
    const records = await modelDelegate.findMany({
      where,
      select: { reference: true },
    })

    const countMap = new Map<string, number>()
    for (const r of records) {
      if (Array.isArray(r.reference)) {
        for (const ref of r.reference) {
          if (!ref) continue
          countMap.set(ref, (countMap.get(ref) || 0) + 1)
        }
      } else if (typeof r.reference === "string" && r.reference.trim()) {
        countMap.set(r.reference, (countMap.get(r.reference) || 0) + 1)
      }
    }

    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([rawRef, count]) => ({
        rawRef,
        count,
      }))
  } catch {
    return []
  }
}

export async function getAvailableSources(
  db: PrismaClient,
  input: {
    subjectId: string
    chapterId?: string
    questionTypeId?: string
    category?: string
  }
) {
  let effectiveCategory = input.category || "MCQ"
  if ((!effectiveCategory || effectiveCategory === QUESTION_TYPE_CODES.MCQ) && input.questionTypeId && input.questionTypeId !== "all" && input.questionTypeId !== "All") {
    const qt = await db.questionType.findUnique({ where: { id: input.questionTypeId }, select: { nameEn: true, nameBn: true, label: true } })
    if (qt) {
      const norm = normalizeQuestionTypeName(qt.nameEn) || normalizeQuestionTypeName(qt.nameBn) || normalizeQuestionTypeName(qt.label)
      if (norm && NORMALIZED_TO_CATEGORY[norm]) {
        effectiveCategory = NORMALIZED_TO_CATEGORY[norm] as any
      }
    }
  }

  const config = CATEGORY_QUERY_CONFIG[effectiveCategory] || CATEGORY_QUERY_CONFIG.MCQ!
  const modelName = config.model

  const where: any = {
    subjectId: input.subjectId,
    deletedAt: null,
    isGlobal: true,
    source: { not: null },
  }
  if (config.hasIsActive) {
    where.isActive = true
  }

  if (input.chapterId && input.chapterId !== "all" && input.chapterId !== "All") {
    if (["PARAGRAPH", "AMPLIFICATION", "PBQ", "PARTS_OF_SPEECH", "FILL_IN_THE_BLANKS_WITH_CLUES", "FILL_IN_THE_BLANKS_WITHOUT_CLUES", "WORD_MEANING", "MAKE_SENTENCES", "MAKE_QUESTION", "OPPOSITE_WORD", "SYNONYM", "SADHU_TO_CHOLITO", "POD_NIRNOY", "VERB_TENSE", "POEM_ESSENCE", "PROSE_ESSENCE", "SHORT_QUESTION", "DESCRIPTIVE_QUESTION"].includes(effectiveCategory)) {
      where.academicChapterId = input.chapterId
    } else if (!["APPLICATION", "LETTER", "SUMMARY", "ESSENCE", "POEM", "NEWS_REPORT", "ESSAY", "SUBSTITUTION_TABLE", "CHANGING_SENTENCES", "PUNCTUATION"].includes(effectiveCategory)) {
      where.chapterId = input.chapterId
    }
  }

  const modelDelegate = (db as any)[modelName]
  if (!modelDelegate) return []

  try {
    const records = await modelDelegate.findMany({
      where,
      select: { source: true },
    })

    const countMap = new Map<string, number>()
    for (const r of records) {
      const trimmed = r.source?.trim()
      if (!trimmed) continue
      countMap.set(trimmed, (countMap.get(trimmed) || 0) + 1)
    }

    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([rawSource, count]) => ({
        rawSource,
        count,
      }))
  } catch {
    return []
  }
}
