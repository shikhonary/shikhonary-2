import type { PrismaClient } from "@workspace/db/main"
import { QUESTION_TYPE_CODES, QUESTION_TYPE_MAP, normalizeQuestionTypeName, type QuestionTypeCode } from "@workspace/utils"
import { CATEGORY_QUERY_CONFIG, NORMALIZED_TO_CATEGORY } from "../question-paper/services/paper-available.service"
import type {
  ListQuestionBankInput,
  GetQuestionDetailsInput,
  GetQuestionBankStatsInput,
  GetFilterOptionsInput,
  GetClassDetailsInput,
  GetSubjectDetailsInput,
} from "./question-bank.schema"

export interface NormalizedQuestionItem {
  id: string
  category: string
  categoryLabelEn: string
  categoryLabelBn: string
  subjectId: string
  subjectNameEn: string
  subjectNameBn: string
  chapterId?: string | null
  chapterNameEn?: string | null
  chapterNameBn?: string | null
  questionText: string
  context?: string | null
  options?: string[]
  answer?: string | null
  explanation?: string | null
  difficulty: string
  reference: string[]
  source?: string | null
  session?: string | null
  isMath: boolean
  attachments?: any[]
  subQuestions?: { label: string; question: string; mark?: number }[]
  columnA?: string[]
  columnB?: string[]
  columnC?: string[]
  createdAt: Date
}

export async function listQuestions(
  db: PrismaClient,
  input: ListQuestionBankInput
) {
  const {
    classId,
    subjectId,
    chapterId,
    category = "MCQ",
    difficulty,
    search,
    board,
    sort = "newest",
    page = 1,
    limit = 12,
  } = input

  const sortOrder: "asc" | "desc" = sort === "oldest" ? "asc" : "desc"
  const resolvedCategory = (category || "MCQ").toUpperCase()
  const config = CATEGORY_QUERY_CONFIG[resolvedCategory] || CATEGORY_QUERY_CONFIG.MCQ!

  // Build subject filtering: if classId is given without subjectId, find all subject IDs in this class
  let effectiveSubjectIds: string[] | undefined = undefined
  if (subjectId && subjectId !== "all" && subjectId !== "All") {
    effectiveSubjectIds = [subjectId]
  } else if (classId && classId !== "all" && classId !== "All") {
    const subjectsInClass = await db.academicSubject.findMany({
      where: {
        classSubjects: {
          some: { classId },
        },
        isActive: true,
      },
      select: { id: true },
    })
    effectiveSubjectIds = subjectsInClass.map((s) => s.id)
  }

  const where: any = {
    isGlobal: true,
    deletedAt: null,
  }

  if (config.hasIsActive) {
    where.isActive = true
  }

  if (effectiveSubjectIds !== undefined) {
    where.subjectId = { in: effectiveSubjectIds }
  }

  if (chapterId && chapterId !== "all" && chapterId !== "All") {
    const chapterField = [
      "PARAGRAPH",
      "AMPLIFICATION",
      "PBQ",
      "PARTS_OF_SPEECH",
      "FILL_IN_THE_BLANKS_WITH_CLUES",
      "FILL_IN_THE_BLANKS_WITHOUT_CLUES",
      "WORD_MEANING",
      "MAKE_SENTENCES",
      "OPPOSITE_WORD",
      "JUKTOBORNO",
      "EK_KOTHAY_PROKASH",
      "SYNONYM",
      "SADHU_TO_CHOLITO",
      "POD_NIRNOY",
      "VERB_TENSE",
      "FORM_FILLUP",
      "FORM_FILLING",
      "SHUDDHO_ASHUDDHO",
      "DAN_BAM_MILKORON",
      "POEM_ESSENCE",
      "PROSE_ESSENCE",
      "SHORT_QUESTION",
      "MAKE_QUESTION",
      "DESCRIPTIVE_QUESTION",
    ].includes(resolvedCategory)
      ? "academicChapterId"
      : "chapterId"

    where[chapterField] = chapterId
  }

  if (difficulty && difficulty !== "all" && difficulty !== "All") {
    where.difficulty = difficulty
  }

  if (board && board !== "all" && board !== "All") {
    where.reference = { has: board }
  }

  if (search && search.trim()) {
    const term = search.trim()
    where.OR = config.searchFields.map((field) => ({
      [field]: { contains: term, mode: "insensitive" },
    }))
  }

  const model = (db as any)[config.model]
  if (!model) {
    return {
      items: [],
      totalItems: 0,
      page,
      limit,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    }
  }

  const skip = (page - 1) * limit

  // Ensure includes contains subject and attachments
  const queryIncludes = {
    ...config.includes,
    subject: {
      select: {
        id: true,
        nameEn: true,
        nameBn: true,
      },
    },
  }

  let [rawItems, totalItems] = await Promise.all([
    model
      .findMany({
        where,
        skip,
        take: limit,
        include: queryIncludes,
        orderBy: { createdAt: sortOrder },
      })
      .catch(() => []),
    model.count({ where }).catch(() => 0),
  ])

  // Fallback without isActive if 0 results
  if (rawItems.length === 0 && where.isActive !== undefined) {
    delete where.isActive
    ;[rawItems, totalItems] = await Promise.all([
      model
        .findMany({
          where,
          skip,
          take: limit,
          include: queryIncludes,
          orderBy: { createdAt: sortOrder },
        })
        .catch(() => []),
      model.count({ where }).catch(() => 0),
    ])
  }

  const typeDef = Object.values(QUESTION_TYPE_MAP).find(
    (t) => t.code === resolvedCategory
  )
  const categoryLabelEn = typeDef?.nameEn || resolvedCategory
  const categoryLabelBn = typeDef?.nameBn || resolvedCategory

  const items: NormalizedQuestionItem[] = rawItems.map((item: any) => {
    const ch = item.academicChapter || item.chapter
    const subject = item.subject || {}

    // Extract sub-questions for CQ or PBQ
    let subQuestions: { label: string; question: string; mark?: number }[] | undefined = undefined
    if (resolvedCategory === "CQ" || resolvedCategory === "CS") {
      subQuestions = [
        item.questionA ? { label: "ক", question: item.questionA, mark: 1 } : null,
        item.questionB ? { label: "খ", question: item.questionB, mark: 2 } : null,
        item.questionC ? { label: "গ", question: item.questionC, mark: 3 } : null,
        item.questionD ? { label: "ঘ", question: item.questionD, mark: 4 } : null,
      ].filter(Boolean) as any
    } else if (resolvedCategory === "PBQ") {
      subQuestions = [
        item.questionA ? { label: "ক", question: item.questionA } : null,
        item.questionB ? { label: "খ", question: item.questionB } : null,
        item.questionC ? { label: "গ", question: item.questionC } : null,
        item.questionD ? { label: "ঘ", question: item.questionD } : null,
        item.questionE ? { label: "ঙ", question: item.questionE } : null,
      ].filter(Boolean) as any
    }

    // Determine normalized primary question text
    const questionText =
      item.question ||
      item.title ||
      item.name ||
      item.phrase ||
      item.word ||
      item.verb ||
      item.scenario ||
      item.sentence ||
      item.content ||
      item.rawText ||
      item.prompt ||
      (resolvedCategory === "CQ" ? "সৃজনশীল উদ্দীপক ও প্রশ্নমালা" : "প্রশ্ন বিবরণ")

    return {
      id: item.id,
      category: resolvedCategory,
      categoryLabelEn,
      categoryLabelBn,
      subjectId: item.subjectId || subject.id,
      subjectNameEn: subject.nameEn || "",
      subjectNameBn: subject.nameBn || "",
      chapterId: item.academicChapterId || item.chapterId || null,
      chapterNameEn: ch?.nameEn || null,
      chapterNameBn: ch?.nameBn || null,
      questionText,
      context: item.context || null,
      options: Array.isArray(item.options) ? item.options : undefined,
      answer: item.answer || item.answerText || item.meaning || null,
      explanation: item.explanation || null,
      difficulty: item.difficulty || "MEDIUM",
      reference: Array.isArray(item.reference) ? item.reference : [],
      source: item.source || null,
      session: item.session || null,
      isMath: Boolean(item.isMath),
      attachments: item.attachments || [],
      subQuestions,
      columnA: Array.isArray(item.columnA) ? item.columnA : undefined,
      columnB: Array.isArray(item.columnB) ? item.columnB : undefined,
      columnC: Array.isArray(item.columnC) ? item.columnC : undefined,
      createdAt: item.createdAt || new Date(),
    }
  })

  const totalPages = Math.max(1, Math.ceil(totalItems / limit))

  return {
    items,
    totalItems,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

export async function getQuestionStats(
  db: PrismaClient,
  input: GetQuestionBankStatsInput = {}
) {
  const where: any = { isGlobal: true, deletedAt: null }
  if (input.subjectId) {
    where.subjectId = input.subjectId
  } else if (input.classId) {
    const subjects = await db.academicSubject.findMany({
      where: { classSubjects: { some: { classId: input.classId } }, isActive: true },
      select: { id: true },
    })
    where.subjectId = { in: subjects.map((s) => s.id) }
  }

  const [
    totalMcqs,
    totalCqs,
    totalShortAnswers,
    totalPbqs,
    totalSubjects,
    totalClasses,
  ] = await Promise.all([
    db.mcq.count({ where }).catch(() => 0),
    db.cq.count({ where }).catch(() => 0),
    db.shortAnswer.count({ where }).catch(() => 0),
    db.pBQ.count({ where }).catch(() => 0),
    db.academicSubject.count({ where: { isActive: true } }).catch(() => 0),
    db.academicClass.count({ where: { isActive: true } }).catch(() => 0),
  ])

  const totalQuestions = totalMcqs + totalCqs + totalShortAnswers + totalPbqs

  return {
    totalQuestions,
    totalMcqs,
    totalCqs,
    totalShortAnswers,
    totalPbqs,
    totalSubjects,
    totalClasses,
  }
}

export async function getQuestionDetails(
  db: PrismaClient,
  input: GetQuestionDetailsInput
) {
  const { id, category } = input
  const resolvedCategory = (category || "MCQ").toUpperCase()
  const config = CATEGORY_QUERY_CONFIG[resolvedCategory] || CATEGORY_QUERY_CONFIG.MCQ!
  const model = (db as any)[config.model]

  if (!model) {
    return null
  }

  const item = await model.findUnique({
    where: { id },
    include: {
      ...config.includes,
      subject: {
        select: {
          id: true,
          nameEn: true,
          nameBn: true,
        },
      },
    },
  })

  if (!item) return null

  const ch = item.academicChapter || item.chapter
  const subject = item.subject || {}
  const typeDef = Object.values(QUESTION_TYPE_MAP).find(
    (t) => t.code === resolvedCategory
  )

  let subQuestions: { label: string; question: string; mark?: number }[] | undefined = undefined
  if (resolvedCategory === "CQ" || resolvedCategory === "CS") {
    subQuestions = [
      item.questionA ? { label: "ক", question: item.questionA, mark: 1 } : null,
      item.questionB ? { label: "খ", question: item.questionB, mark: 2 } : null,
      item.questionC ? { label: "গ", question: item.questionC, mark: 3 } : null,
      item.questionD ? { label: "ঘ", question: item.questionD, mark: 4 } : null,
    ].filter(Boolean) as any
  } else if (resolvedCategory === "PBQ") {
    subQuestions = [
      item.questionA ? { label: "ক", question: item.questionA } : null,
      item.questionB ? { label: "খ", question: item.questionB } : null,
      item.questionC ? { label: "গ", question: item.questionC } : null,
      item.questionD ? { label: "ঘ", question: item.questionD } : null,
      item.questionE ? { label: "ঙ", question: item.questionE } : null,
    ].filter(Boolean) as any
  }

  const questionText =
    item.question ||
    item.title ||
    item.name ||
    item.phrase ||
    item.word ||
    item.verb ||
    item.scenario ||
    item.sentence ||
    item.content ||
    item.rawText ||
    item.prompt ||
    ""

  return {
    ...item,
    id: item.id,
    category: resolvedCategory,
    categoryLabelEn: typeDef?.nameEn || resolvedCategory,
    categoryLabelBn: typeDef?.nameBn || resolvedCategory,
    subjectNameEn: subject.nameEn || "",
    subjectNameBn: subject.nameBn || "",
    chapterNameEn: ch?.nameEn || null,
    chapterNameBn: ch?.nameBn || null,
    questionText,
    subQuestions,
  }
}

export async function getFilterOptions(
  db: PrismaClient,
  input: GetFilterOptionsInput = {}
) {
  const [classes, subjects, chapters] = await Promise.all([
    db.academicClass.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
      select: { id: true, nameEn: true, nameBn: true },
    }),
    db.academicSubject.findMany({
      where: {
        isActive: true,
        ...(input.classId && input.classId !== "all"
          ? { classSubjects: { some: { classId: input.classId } } }
          : {}),
      },
      orderBy: { nameEn: "asc" },
      select: { id: true, nameEn: true, nameBn: true, code: true },
    }),
    input.subjectId && input.subjectId !== "all"
      ? db.academicChapter.findMany({
          where: { subjectId: input.subjectId },
          orderBy: { position: "asc" },
          select: { id: true, nameEn: true, nameBn: true, position: true },
        })
      : Promise.resolve([]),
  ])

  // Top common question categories for convenient tabs/filters
  const categories = [
    { code: QUESTION_TYPE_CODES.MCQ, nameEn: "MCQ", nameBn: "বহুনির্বাচনি" },
    { code: QUESTION_TYPE_CODES.CQ, nameEn: "CQ", nameBn: "সৃজনশীল" },
    { code: QUESTION_TYPE_CODES.SA, nameEn: "Short Answer", nameBn: "সংক্ষিপ্ত-উত্তর" },
    { code: QUESTION_TYPE_CODES.PBQ, nameEn: "Passage Based", nameBn: "অনুচ্ছেদভিত্তিক" },
    { code: QUESTION_TYPE_CODES.PARAGRAPH, nameEn: "Paragraph", nameBn: "অনুচ্ছেদ" },
    { code: QUESTION_TYPE_CODES.RIGHT_FORM_OF_VERBS, nameEn: "Right Form of Verbs", nameBn: "ক্রিয়ার সঠিক রূপ" },
    { code: QUESTION_TYPE_CODES.CHANGING_SENTENCES, nameEn: "Changing Sentences", nameBn: "বাক্য রূপান্তর" },
    { code: QUESTION_TYPE_CODES.FILL_IN_THE_BLANKS_WITH_CLUES, nameEn: "Fill in Blanks (Clues)", nameBn: "শূন্যস্থান পূরণ (ক্লুসহ)" },
    { code: QUESTION_TYPE_CODES.WORD_MEANING, nameEn: "Word Meaning", nameBn: "শব্দার্থ" },
    { code: QUESTION_TYPE_CODES.JUKTOBORNO, nameEn: "Juktoborno", nameBn: "যুক্তবর্ণ" },
    { code: QUESTION_TYPE_CODES.EK_KOTHAY_PROKASH, nameEn: "Ek Kothay Prokash", nameBn: "এক কথায় প্রকাশ" },
    { code: QUESTION_TYPE_CODES.DAN_BAM_MILKORON, nameEn: "Matching", nameBn: "ডান-বাম মিলকরণ" },
  ]

  return {
    classes,
    subjects,
    chapters,
    categories,
  }
}

export async function getClassesWithStats(db: PrismaClient) {
  const classes = await db.academicClass.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
    include: {
      classSubjects: {
        where: { academicSubject: { isActive: true } },
        include: {
          academicSubject: {
            select: {
              id: true,
              nameEn: true,
              nameBn: true,
              code: true,
              group: true,
            },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  })

  const uniqueSubjectIds = new Set<string>()
  classes.forEach((c) => {
    c.classSubjects.forEach((cs) => {
      uniqueSubjectIds.add(cs.academicSubject.id)
    })
  })

  return {
    classes: classes.map((c) => ({
      id: c.id,
      nameEn: c.nameEn,
      nameBn: c.nameBn,
      position: c.position,
      subjectCount: c.classSubjects.length,
      subjects: c.classSubjects.map((cs) => cs.academicSubject),
    })),
    totalClasses: classes.length,
    totalSubjects: uniqueSubjectIds.size,
  }
}

export async function getClassDetails(
  db: PrismaClient,
  input: GetClassDetailsInput
) {
  const { classId } = input

  const academicClass = await db.academicClass.findUnique({
    where: { id: classId, isActive: true },
    include: {
      classSubjects: {
        where: { academicSubject: { isActive: true } },
        orderBy: { position: "asc" },
        include: {
          academicSubject: {
            include: {
              chapters: {
                where: { isActive: true },
                orderBy: { position: "asc" },
                select: {
                  id: true,
                  nameEn: true,
                  nameBn: true,
                  position: true,
                },
              },
              _count: {
                select: {
                  subjectQuestionTypes: true,
                  mcqs: true,
                  cqs: true,
                  shortAnswers: true,
                  paragraphs: true,
                  pbqs: true,
                  shortQuestions: true,
                  ekKothayProkashes: true,
                  wordMeanings: true,
                  descriptiveQuestions: true,
                  amplifications: true,
                  letters: true,
                  applications: true,
                  summaries: true,
                  essences: true,
                  poemEssences: true,
                  proseEssences: true,
                  makeQuestions: true,
                  sadhuToCholitos: true,
                  thoughtExpansions: true,
                  newsReports: true,
                  essays: true,
                  partsOfSpeech: true,
                  podNirnoys: true,
                  verbTenses: true,
                  rightFormOfVerbs: true,
                  changingSentences: true,
                  fillInTheBlanksWithClues: true,
                  fillInTheBlanksWithoutClues: true,
                  substitutionTables: true,
                  punctuations: true,
                  shortCompositions: true,
                  poems: true,
                  makeSentences: true,
                  juktobornos: true,
                  oppositeWords: true,
                  genderChanges: true,
                  synonyms: true,
                  formFillups: true,
                  shuddhoAshuddhos: true,
                  danBamMilkorons: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!academicClass) {
    throw new Error("Class not found")
  }

  let totalChapters = 0
  let totalQuestions = 0

  const subjects = academicClass.classSubjects.map((cs) => {
    const s = cs.academicSubject
    const chaptersCount = s.chapters.length
    totalChapters += chaptersCount

    const counts = s._count || {}
    const categoryCounts: number[] = [
      counts.mcqs || 0,
      counts.cqs || 0,
      counts.shortAnswers || 0,
      counts.paragraphs || 0,
      counts.pbqs || 0,
      counts.shortQuestions || 0,
      counts.ekKothayProkashes || 0,
      counts.wordMeanings || 0,
      counts.descriptiveQuestions || 0,
      counts.amplifications || 0,
      counts.letters || 0,
      counts.applications || 0,
      counts.summaries || 0,
      counts.essences || 0,
      counts.poemEssences || 0,
      counts.proseEssences || 0,
      counts.makeQuestions || 0,
      counts.sadhuToCholitos || 0,
      counts.thoughtExpansions || 0,
      counts.newsReports || 0,
      counts.essays || 0,
      counts.partsOfSpeech || 0,
      counts.podNirnoys || 0,
      counts.verbTenses || 0,
      counts.rightFormOfVerbs || 0,
      counts.changingSentences || 0,
      counts.fillInTheBlanksWithClues || 0,
      counts.fillInTheBlanksWithoutClues || 0,
      counts.substitutionTables || 0,
      counts.punctuations || 0,
      counts.shortCompositions || 0,
      counts.poems || 0,
      counts.makeSentences || 0,
      counts.juktobornos || 0,
      counts.oppositeWords || 0,
      counts.genderChanges || 0,
      counts.synonyms || 0,
      counts.formFillups || 0,
      counts.shuddhoAshuddhos || 0,
      counts.danBamMilkorons || 0,
    ]

    const activeCategoriesWithQuestions = categoryCounts.filter((c) => c > 0).length

    // Use explicit SubjectQuestionType mappings if defined, otherwise fallback to active categories count
    const questionTypesCount =
      counts.subjectQuestionTypes && counts.subjectQuestionTypes > 0
        ? counts.subjectQuestionTypes
        : activeCategoriesWithQuestions

    const subjectQuestionCount = categoryCounts.reduce((acc, c) => acc + c, 0)
    totalQuestions += subjectQuestionCount

    return {
      id: s.id,
      nameEn: s.nameEn,
      nameBn: s.nameBn,
      code: s.code,
      group: s.group,
      position: cs.position,
      chaptersCount,
      questionCount: subjectQuestionCount,
      questionTypesCount,
      chapters: s.chapters,
    }
  })

  return {
    class: {
      id: academicClass.id,
      nameEn: academicClass.nameEn,
      nameBn: academicClass.nameBn,
      position: academicClass.position,
    },
    subjects,
    totalSubjects: subjects.length,
    totalChapters,
    totalQuestions,
  }
}

const CATEGORY_COUNT_KEY_MAP: Record<string, string> = {
  MCQ: "mcqs",
  CQ: "cqs",
  CS: "cqs",
  SA: "shortAnswers",
  PARAGRAPH: "paragraphs",
  PBQ: "pbqs",
  SHORT_QUESTION: "shortQuestions",
  EK_KOTHAY_PROKASH: "ekKothayProkashes",
  WORD_MEANING: "wordMeanings",
  DESCRIPTIVE_QUESTION: "descriptiveQuestions",
  AMPLIFICATION: "amplifications",
  LETTER: "letters",
  APPLICATION: "applications",
  SUMMARY: "summaries",
  ESSENCE: "essences",
  POEM_ESSENCE: "poemEssences",
  PROSE_ESSENCE: "proseEssences",
  MAKE_QUESTION: "makeQuestions",
  SADHU_TO_CHOLITO: "sadhuToCholitos",
  THOUGHT_EXPANSION: "thoughtExpansions",
  NEWS_REPORT: "newsReports",
  ESSAY: "essays",
  PARTS_OF_SPEECH: "partsOfSpeech",
  POD_NIRNOY: "podNirnoys",
  VERB_TENSE: "verbTenses",
  RIGHT_FORM_OF_VERBS: "rightFormOfVerbs",
  CHANGING_SENTENCES: "changingSentences",
  FILL_IN_THE_BLANKS_WITH_CLUES: "fillInTheBlanksWithClues",
  FILL_IN_THE_BLANKS_WITHOUT_CLUES: "fillInTheBlanksWithoutClues",
  SUBSTITUTION_TABLE: "substitutionTables",
  PUNCTUATION: "punctuations",
  SHORT_COMPOSITION: "shortCompositions",
  POEM: "poems",
  MAKE_SENTENCES: "makeSentences",
  JUKTOBORNO: "juktobornos",
  OPPOSITE_WORD: "oppositeWords",
  GENDER_CHANGE: "genderChanges",
  SYNONYM: "synonyms",
  FORM_FILLUP: "formFillups",
  FORM_FILLING: "formFillups",
  SHUDDHO_ASHUDDHO: "shuddhoAshuddhos",
  DAN_BAM_MILKORON: "danBamMilkorons",
}

export async function getSubjectDetails(
  db: PrismaClient,
  input: GetSubjectDetailsInput
) {
  const [academicClass, subject] = await Promise.all([
    db.academicClass.findUnique({
      where: { id: input.classId },
      select: { id: true, nameEn: true, nameBn: true, position: true },
    }),
    db.academicSubject.findUnique({
      where: { id: input.subjectId },
      include: {
        chapters: {
          where: { isActive: true },
          orderBy: { position: "asc" },
          select: { id: true, nameEn: true, nameBn: true, position: true },
        },
        subjectQuestionTypes: {
          include: { questionType: true },
        },
        _count: {
          select: {
            mcqs: true,
            cqs: true,
            shortAnswers: true,
            paragraphs: true,
            pbqs: true,
            shortQuestions: true,
            ekKothayProkashes: true,
            wordMeanings: true,
            descriptiveQuestions: true,
            amplifications: true,
            letters: true,
            applications: true,
            summaries: true,
            essences: true,
            poemEssences: true,
            proseEssences: true,
            makeQuestions: true,
            sadhuToCholitos: true,
            thoughtExpansions: true,
            newsReports: true,
            essays: true,
            partsOfSpeech: true,
            podNirnoys: true,
            verbTenses: true,
            rightFormOfVerbs: true,
            changingSentences: true,
            fillInTheBlanksWithClues: true,
            fillInTheBlanksWithoutClues: true,
            substitutionTables: true,
            punctuations: true,
            shortCompositions: true,
            poems: true,
            makeSentences: true,
            juktobornos: true,
            oppositeWords: true,
            genderChanges: true,
            synonyms: true,
            formFillups: true,
            shuddhoAshuddhos: true,
            danBamMilkorons: true,
          },
        },
      },
    }),
  ])

  if (!subject) {
    throw new Error("Subject not found")
  }

  const counts: Record<string, number> = (subject._count as any) || {}
  const questionTypeMap = new Map<
    string,
    { id: string; code: string; nameEn: string; nameBn: string; count: number }
  >()

  // 1. Process explicit subjectQuestionTypes
  for (const sqt of subject.subjectQuestionTypes || []) {
    const qt = sqt.questionType
    if (!qt) continue
    const norm =
      normalizeQuestionTypeName(qt.nameEn) ||
      normalizeQuestionTypeName(qt.nameBn) ||
      normalizeQuestionTypeName(qt.label)
    const code = (norm && NORMALIZED_TO_CATEGORY[norm]) || qt.nameEn.toUpperCase()
    const countKey = CATEGORY_COUNT_KEY_MAP[code]
    const count = countKey && counts[countKey] !== undefined ? counts[countKey] : 0
    questionTypeMap.set(code, {
      id: qt.id,
      code,
      nameEn: qt.nameEn || code,
      nameBn: qt.nameBn || code,
      count,
    })
  }

  // 2. Discover any additional question types that have questions in DB
  for (const [code, countKey] of Object.entries(CATEGORY_COUNT_KEY_MAP)) {
    const count = counts[countKey] || 0
    if (count > 0 && !questionTypeMap.has(code)) {
      const typeDef = Object.values(QUESTION_TYPE_MAP).find((t) => t.code === code)
      questionTypeMap.set(code, {
        id: code,
        code,
        nameEn: typeDef?.nameEn || code,
        nameBn: typeDef?.nameBn || code,
        count,
      })
    }
  }

  // 3. Fallback: if empty, add standard default types (MCQ, CQ, SA, PBQ)
  if (questionTypeMap.size === 0) {
    const defaultCodes = [
      QUESTION_TYPE_CODES.MCQ,
      QUESTION_TYPE_CODES.CQ,
      QUESTION_TYPE_CODES.SA,
      QUESTION_TYPE_CODES.PBQ,
    ]
    for (const code of defaultCodes) {
      const typeDef = Object.values(QUESTION_TYPE_MAP).find((t) => t.code === code)
      questionTypeMap.set(code, {
        id: code,
        code,
        nameEn: typeDef?.nameEn || code,
        nameBn: typeDef?.nameBn || code,
        count: 0,
      })
    }
  }

  const questionTypes = Array.from(questionTypeMap.values()).sort((a, b) => {
    // Sort items with count > 0 first, then by count desc, then alphabetically
    if (a.count > 0 && b.count === 0) return -1
    if (a.count === 0 && b.count > 0) return 1
    if (b.count !== a.count) return b.count - a.count
    return a.nameEn.localeCompare(b.nameEn)
  })

  const totalQuestions = Object.values(counts).reduce((sum, n) => sum + (typeof n === "number" ? n : 0), 0)
  const totalChapters = subject.chapters.length
  const totalQuestionTypes = questionTypes.filter((qt) => qt.count > 0).length

  return {
    class: academicClass
      ? {
          id: academicClass.id,
          nameEn: academicClass.nameEn,
          nameBn: academicClass.nameBn,
          position: academicClass.position,
        }
      : null,
    subject: {
      id: subject.id,
      nameEn: subject.nameEn,
      nameBn: subject.nameBn,
      code: subject.code,
      group: subject.group,
    },
    chapters: subject.chapters,
    questionTypes,
    totalQuestions,
    totalChapters,
    totalQuestionTypes: totalQuestionTypes > 0 ? totalQuestionTypes : questionTypes.length,
  }
}



