import { TRPCError } from "@trpc/server"
import type { PrismaClient } from "@workspace/db/main"
import type { TenantPrismaClient } from "@workspace/db/tenant"
import { notFound } from "../../../utils/errors"
import type {
  ListQuestionPapersInput,
  GetQuestionPaperInput,
  CreateQuestionPaperInput,
  CreateQuestionPaperFullInput,
  UpdateQuestionPaperInput,
  DeleteQuestionPaperInput,
  DuplicateQuestionPaperInput,
  UpdateQuestionPaperSettingsInput,
} from "../question-paper.schema"
import { logHistory } from "./helpers/history-logger"
import { syncMarkDistribution } from "./helpers/totals-calculator"
import { freezeQuestionSnapshots } from "./helpers/snapshot-freezer"

export async function listQuestionPapers(
  tenantDb: TenantPrismaClient,
  input: ListQuestionPapersInput
) {
  const where: any = { deletedAt: null }

  if (input.classId && input.classId !== "All") {
    where.classId = input.classId
  }

  if (input.status) {
    where.status = input.status
  }

  if (input.isTemplate !== undefined) {
    where.isTemplate = input.isTemplate
  }

  if (input.search && input.search.trim() !== "") {
    where.OR = [
      { title: { contains: input.search.trim(), mode: "insensitive" } },
      { examName: { contains: input.search.trim(), mode: "insensitive" } },
    ]
  }

  let orderBy: any = { createdAt: "desc" }
  if (input.sort === "title_asc") {
    orderBy = { title: "asc" }
  } else if (input.sort === "title_desc") {
    orderBy = { title: "desc" }
  } else if (input.sort === "newest") {
    orderBy = { createdAt: "desc" }
  } else if (input.sort === "oldest") {
    orderBy = { createdAt: "asc" }
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 10
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [papers, totalItems] = await Promise.all([
    tenantDb.questionPaper.findMany({
      where,
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy,
    }),
    tenantDb.questionPaper.count({ where }),
  ])

  const nextCursor =
    papers.length === limit
      ? papers[papers.length - 1]?.id
      : undefined

  return { papers, totalItems, nextCursor }
}

export async function getQuestionPaperById(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: GetQuestionPaperInput
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.id },
    include: {
      questions: {
        where: { parentQuestionId: null },
        orderBy: { orderIndex: "asc" },
        include: {
          distribution: true,
          alternatives: {
            orderBy: { orOrder: "asc" },
            include: {
              distribution: true,
            },
          },
        },
      },
      subjects: {
        orderBy: { orderIndex: "asc" },
        include: {
          distributions: {
            orderBy: { orderIndex: "asc" },
            include: {
              subSections: {
                include: {
                  subSection: true,
                },
              },
            },
          },
        },
      },
      sections: {
        orderBy: { orderIndex: "asc" },
        include: {
          subSections: {
            orderBy: { orderIndex: "asc" },
            include: {
              distributions: {
                include: {
                  distribution: true,
                },
              },
            },
          },
        },
      },
      history: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  if (!paper || paper.deletedAt) {
    throw notFound("QuestionPaper")
  }

  // Batch resolve cross-DB references from db in parallel for both primary questions and alternatives
  const allPaperQuestions = [
    ...paper.questions,
    ...paper.questions.flatMap((q: any) => q.alternatives || []),
  ]

  const mcqIds = allPaperQuestions.map((q) => q.mcqId).filter(Boolean) as string[]
  const cqIds = allPaperQuestions.map((q) => q.cqId).filter(Boolean) as string[]
  const csIds = allPaperQuestions.map((q: any) => q.csId).filter(Boolean) as string[]
  const shortAnswerIds = allPaperQuestions.map((q) => q.shortAnswerId).filter(Boolean) as string[]
  const pbqIds = allPaperQuestions.map((q: any) => q.pbqId).filter(Boolean) as string[]
  const paragraphIds = allPaperQuestions.map((q) => q.paragraphId).filter(Boolean) as string[]
  const amplificationIds = allPaperQuestions.map((q) => q.amplificationId).filter(Boolean) as string[]
  const letterIds = allPaperQuestions.map((q: any) => q.letterId).filter(Boolean) as string[]
  const applicationIds = allPaperQuestions.map((q: any) => q.applicationId).filter(Boolean) as string[]
  const summaryIds = allPaperQuestions.map((q: any) => q.summaryId).filter(Boolean) as string[]
  const essenceIds = allPaperQuestions.map((q: any) => q.essenceId).filter(Boolean) as string[]
  const poemEssenceIds = allPaperQuestions.map((q: any) => q.poemEssenceId).filter(Boolean) as string[]
  const proseEssenceIds = allPaperQuestions.map((q: any) => q.proseEssenceId).filter(Boolean) as string[]
  const poemIds = allPaperQuestions.map((q: any) => q.poemId).filter(Boolean) as string[]
  const newsReportIds = allPaperQuestions.map((q: any) => q.newsReportId).filter(Boolean) as string[]
  const essayIds = allPaperQuestions.map((q: any) => q.essayId).filter(Boolean) as string[]
  const partsOfSpeechIds = allPaperQuestions.map((q: any) => q.partsOfSpeechId).filter(Boolean) as string[]
  const rightFormOfVerbIds = allPaperQuestions.map((q: any) => q.rightFormOfVerbId).filter(Boolean) as string[]
  const changingSentenceIds = allPaperQuestions.map((q: any) => q.changingSentenceId).filter(Boolean) as string[]
  const fillInTheBlanksWithCluesIds = allPaperQuestions.map((q: any) => q.fillInTheBlanksWithCluesId).filter(Boolean) as string[]
  const fillInTheBlanksWithoutCluesIds = allPaperQuestions.map((q: any) => q.fillInTheBlanksWithoutCluesId).filter(Boolean) as string[]
  const substitutionTableIds = allPaperQuestions.map((q: any) => q.substitutionTableId).filter(Boolean) as string[]
  const punctuationIds = allPaperQuestions.map((q: any) => q.punctuationId).filter(Boolean) as string[]
  const shortCompositionIds = allPaperQuestions.map((q: any) => q.shortCompositionId).filter(Boolean) as string[]
  const descriptiveQuestionIds = allPaperQuestions.map((q: any) => q.descriptiveQuestionId).filter(Boolean) as string[]
  const shortQuestionIds = allPaperQuestions.map((q: any) => q.shortQuestionId).filter(Boolean) as string[]
  const makeQuestionIds = allPaperQuestions.map((q: any) => q.makeQuestionId).filter(Boolean) as string[]
  const wordMeaningIds = allPaperQuestions.map((q: any) => q.wordMeaningId).filter(Boolean) as string[]
  const makeSentencesIds = allPaperQuestions.map((q: any) => q.makeSentencesId).filter(Boolean) as string[]
  const oppositeWordIds = allPaperQuestions.map((q: any) => q.oppositeWordId).filter(Boolean) as string[]
  const juktobornoIds = allPaperQuestions.map((q: any) => q.juktobornoId).filter(Boolean) as string[]
  const ekKothayProkashIds = allPaperQuestions.map((q: any) => q.ekKothayProkashId).filter(Boolean) as string[]
  const synonymIds = allPaperQuestions.map((q: any) => q.synonymId).filter(Boolean) as string[]
  const sadhuToCholitoIds = allPaperQuestions.map((q: any) => q.sadhuToCholitoId).filter(Boolean) as string[]
  const podNirnoyIds = allPaperQuestions.map((q: any) => q.podNirnoyId).filter(Boolean) as string[]
  const verbTenseIds = allPaperQuestions.map((q: any) => q.verbTenseId).filter(Boolean) as string[]
  const formFillupIds = allPaperQuestions.map((q: any) => q.formFillupId).filter(Boolean) as string[]
  const shuddhoAshuddhoIds = allPaperQuestions.map((q: any) => q.shuddhoAshuddhoId).filter(Boolean) as string[]
  const danBamMilkoronIds = allPaperQuestions.map((q: any) => q.danBamMilkoronId).filter(Boolean) as string[]

  const subjectIds = Array.from(new Set(paper.subjects.map((s) => s.subjectId).filter(Boolean)))
  const questionTypeIds = Array.from(
    new Set(paper.subjects.flatMap((s) => s.distributions.map((d) => d.questionTypeId)).filter(Boolean))
  )

  const [
    mcqs,
    cqs,
    cses,
    shortAnswers,
    pbqs,
    paragraphs,
    amplifications,
    letters,
    applications,
    summaries,
    essences,
    poemEssences,
    proseEssences,
    poems,
    newsReports,
    essays,
    partsOfSpeeches,
    rightFormOfVerbs,
    changingSentences,
    fillInTheBlanksWithClueses,
    fillInTheBlanksWithoutClueses,
    substitutionTables,
    punctuations,
    shortCompositions,
    descriptiveQuestions,
    shortQuestions,
    makeQuestionsList,
    wordMeanings,
    makeSentencesList,
    oppositeWords,
    juktobornos,
    ekKothayProkashs,
    synonyms,
    sadhuToCholitos,
    podNirnoys,
    verbTenses,
    formFillups,
    shuddhoAshuddhos,
    danBamMilkorons,
    academicClass,
    academicSubjects,
    questionTypes,
  ] = await Promise.all([
    mcqIds.length > 0
      ? db.mcq.findMany({
        where: { id: { in: mcqIds } },
        include: {
          attachments: true,
          chapter: true,
          questionType: true,
        },
      })
      : [],
    cqIds.length > 0
      ? db.cq.findMany({
        where: { id: { in: cqIds } },
        include: {
          attachments: true,
          answer: true,
          chapter: true,
          questionType: true,
        },
      })
      : [],
    csIds.length > 0
      ? (db as any).cS.findMany({
        where: { id: { in: csIds } },
        include: {
          chapter: true,
          questionType: true,
        },
      })
      : [],
    shortAnswerIds.length > 0
      ? db.shortAnswer.findMany({
        where: { id: { in: shortAnswerIds } },
        include: {
          attachments: true,
          chapter: true,
          questionType: true,
        },
      })
      : [],
    pbqIds.length > 0
      ? db.pBQ.findMany({
        where: { id: { in: pbqIds } },
        include: {
          academicChapter: true,
          questionType: true,
        },
      })
      : [],
    paragraphIds.length > 0
      ? db.paragraph.findMany({
        where: { id: { in: paragraphIds } },
        include: {
          academicChapter: true,
          questionType: true,
        },
      })
      : [],
    amplificationIds.length > 0
      ? db.amplification.findMany({
        where: { id: { in: amplificationIds } },
        include: {
          academicChapter: true,
          questionType: true,
        },
      })
      : [],
    letterIds.length > 0
      ? (db as any).letter.findMany({
        where: { id: { in: letterIds } },
        include: {
          questionType: true,
        },
      })
      : [],
    applicationIds.length > 0
      ? (db as any).application.findMany({
        where: { id: { in: applicationIds } },
        include: {
          questionType: true,
        },
      })
      : [],
    summaryIds.length > 0
      ? (db as any).summary.findMany({
        where: { id: { in: summaryIds } },
        include: {
          academicChapter: true,
          questionType: true,
        },
      })
      : [],
    essenceIds.length > 0
      ? (db as any).essence.findMany({
        where: { id: { in: essenceIds } },
        include: {
          academicChapter: true,
          questionType: true,
        },
      })
      : [],
    poemEssenceIds.length > 0
      ? (db as any).poemEssence.findMany({
        where: { id: { in: poemEssenceIds } },
        include: {
          academicChapter: true,
          questionType: true,
        },
      })
      : [],
    proseEssenceIds.length > 0
      ? (db as any).proseEssence.findMany({
        where: { id: { in: proseEssenceIds } },
        include: {
          academicChapter: true,
          questionType: true,
        },
      })
      : [],
    poemIds.length > 0
      ? (db as any).poem.findMany({
        where: { id: { in: poemIds } },
        include: {
          questionType: true,
        },
      })
      : [],
    newsReportIds.length > 0
      ? (db as any).newsReport.findMany({
        where: { id: { in: newsReportIds } },
        include: {
          questionType: true,
        },
      })
      : [],
    essayIds.length > 0
      ? (db as any).essay.findMany({
        where: { id: { in: essayIds } },
        include: {
          questionType: true,
        },
      })
      : [],
    partsOfSpeechIds.length > 0
      ? (db as any).partsOfSpeech.findMany({
        where: { id: { in: partsOfSpeechIds } },
        include: {
          academicChapter: true,
          questionType: true,
        },
      })
      : [],
    rightFormOfVerbIds.length > 0
      ? (db as any).rightFormOfVerb.findMany({
        where: { id: { in: rightFormOfVerbIds } },
        include: {
          academicChapter: true,
          questionType: true,
        },
      })
      : [],
    changingSentenceIds.length > 0
      ? (db as any).changingSentence.findMany({
        where: { id: { in: changingSentenceIds } },
        include: {
          academicChapter: true,
          questionType: true,
        },
      })
      : [],
    fillInTheBlanksWithCluesIds.length > 0
      ? (db as any).fillInTheBlanksWithClues.findMany({
        where: { id: { in: fillInTheBlanksWithCluesIds } },
        include: {
          academicChapter: true,
          questionType: true,
        },
      })
      : [],
    fillInTheBlanksWithoutCluesIds.length > 0
      ? (db as any).fillInTheBlanksWithoutClues.findMany({
        where: { id: { in: fillInTheBlanksWithoutCluesIds } },
        include: {
          academicChapter: true,
          questionType: true,
        },
      })
      : [],
    substitutionTableIds.length > 0
      ? db.substitutionTable.findMany({
        where: { id: { in: substitutionTableIds } },
        include: {
          questionType: true,
        },
      })
      : [],
    punctuationIds.length > 0
      ? (db as any).punctuation.findMany({
        where: { id: { in: punctuationIds } },
        include: {
          questionType: true,
          subject: true,
        },
      })
      : [],
    shortCompositionIds.length > 0
      ? (db as any).shortComposition.findMany({
        where: { id: { in: shortCompositionIds } },
        include: {
          questionType: true,
          subject: true,
        },
      })
      : [],
    descriptiveQuestionIds.length > 0
      ? (db as any).descriptiveQuestion.findMany({
        where: { id: { in: descriptiveQuestionIds } },
        include: {
          questionType: true,
          subject: true,
          chapter: true,
        },
      })
      : [],
    shortQuestionIds.length > 0
      ? (db as any).shortQuestion.findMany({
        where: { id: { in: shortQuestionIds } },
        include: {
          questionType: true,
          subject: true,
          chapter: true,
        },
      })
      : [],
    makeQuestionIds.length > 0
      ? (db as any).makeQuestion.findMany({
        where: { id: { in: makeQuestionIds } },
        include: {
          questionType: true,
          subject: true,
          academicChapter: true,
        },
      })
      : [],
    wordMeaningIds.length > 0
      ? (db as any).wordMeaning.findMany({
        where: { id: { in: wordMeaningIds } },
        include: {
          questionType: true,
          academicChapter: true,
        },
      })
      : [],
    makeSentencesIds.length > 0
      ? (db as any).makeSentences.findMany({
        where: { id: { in: makeSentencesIds } },
        include: {
          questionType: true,
          academicChapter: true,
        },
      })
      : [],
    oppositeWordIds.length > 0
      ? (db as any).oppositeWord.findMany({
        where: { id: { in: oppositeWordIds } },
        include: {
          questionType: true,
          academicChapter: true,
        },
      })
      : [],
    juktobornoIds.length > 0
      ? (db as any).juktoborno.findMany({
        where: { id: { in: juktobornoIds } },
        include: {
          questionType: true,
          academicChapter: true,
        },
      })
      : [],
    ekKothayProkashIds.length > 0
      ? (db as any).ekKothayProkash.findMany({
        where: { id: { in: ekKothayProkashIds } },
        include: {
          questionType: true,
          academicChapter: true,
        },
      })
      : [],
    synonymIds.length > 0
      ? (db as any).synonym.findMany({
        where: { id: { in: synonymIds } },
        include: {
          questionType: true,
          academicChapter: true,
        },
      })
      : [],
    sadhuToCholitoIds.length > 0
      ? (db as any).sadhuToCholito.findMany({
        where: { id: { in: sadhuToCholitoIds } },
        include: {
          questionType: true,
          academicChapter: true,
        },
      })
      : [],
    podNirnoyIds.length > 0
      ? (db as any).podNirnoy.findMany({
        where: { id: { in: podNirnoyIds } },
        include: {
          questionType: true,
          academicChapter: true,
        },
      })
      : [],
    verbTenseIds.length > 0
      ? (db as any).verbTense.findMany({
        where: { id: { in: verbTenseIds } },
        include: {
          questionType: true,
          academicChapter: true,
        },
      })
      : [],
    formFillupIds.length > 0
      ? (db as any).formFillup.findMany({
        where: { id: { in: formFillupIds } },
        include: {
          questionType: true,
          academicChapter: true,
        },
      })
      : [],
    shuddhoAshuddhoIds.length > 0
      ? (db as any).shuddhoAshuddho.findMany({
        where: { id: { in: shuddhoAshuddhoIds } },
        include: {
          questionType: true,
          academicChapter: true,
        },
      })
      : [],
    danBamMilkoronIds.length > 0
      ? (db as any).danBamMilkoron.findMany({
        where: { id: { in: danBamMilkoronIds } },
        include: {
          questionType: true,
          academicChapter: true,
        },
      })
      : [],
    paper.classId ? db.academicClass.findUnique({ where: { id: paper.classId } }) : null,
    subjectIds.length > 0 ? db.academicSubject.findMany({ where: { id: { in: subjectIds } } }) : [],
    questionTypeIds.length > 0 ? db.questionType.findMany({ where: { id: { in: questionTypeIds } } }) : [],
  ])

  const mcqMap = new Map(mcqs.map((m) => [m.id, m]))
  const cqMap = new Map(cqs.map((c) => [c.id, c]))
  const csMap = new Map(cses.map((c: any) => [c.id, c]))
  const shortMap = new Map(shortAnswers.map((s) => [s.id, s]))
  const pbqMap = new Map(pbqs.map((p: any) => [p.id, { ...p, chapter: p.academicChapter }]))
  const paragraphMap = new Map(paragraphs.map((p) => [p.id, { ...p, chapter: p.academicChapter }]))
  const amplificationMap = new Map(amplifications.map((a) => [a.id, { ...a, chapter: a.academicChapter }]))
  const letterMap = new Map(letters.map((l: any) => [l.id, l]))
  const applicationMap = new Map(applications.map((a: any) => [a.id, a]))
  const summaryMap = new Map(summaries.map((s: any) => [s.id, s]))
  const essenceMap = new Map(essences.map((e: any) => [e.id, e]))
  const poemEssenceMap = new Map((poemEssences as any[]).map((p: any) => [p.id, { ...p, chapter: p.academicChapter }]))
  const proseEssenceMap = new Map((proseEssences as any[]).map((p: any) => [p.id, { ...p, chapter: p.academicChapter }]))
  const poemMap = new Map(poems.map((p: any) => [p.id, p]))
  const newsReportMap = new Map(newsReports.map((n: any) => [n.id, n]))
  const essayMap = new Map(essays.map((e: any) => [e.id, e]))
  const partsOfSpeechMap = new Map(partsOfSpeeches.map((p: any) => [p.id, { ...p, chapter: p.academicChapter }]))
  const rightFormOfVerbMap = new Map(rightFormOfVerbs.map((p: any) => [p.id, { ...p, chapter: p.academicChapter }]))
  const changingSentenceMap = new Map(changingSentences.map((p: any) => [p.id, p]))
  const fillInTheBlanksWithCluesMap = new Map(fillInTheBlanksWithClueses.map((f: any) => [f.id, { ...f, chapter: f.academicChapter }]))
  const fillInTheBlanksWithoutCluesMap = new Map(fillInTheBlanksWithoutClueses.map((f: any) => [f.id, { ...f, chapter: f.academicChapter }]))
  const substitutionTableMap = new Map(substitutionTables.map((s: any) => [s.id, s]))
  const punctuationMap = new Map(punctuations.map((p: any) => [p.id, p]))
  const shortCompositionMap = new Map(shortCompositions.map((s: any) => [s.id, s]))
  const descriptiveQuestionMap = new Map((descriptiveQuestions as any[]).map((d: any) => [d.id, d]))
  const shortQuestionMap = new Map((shortQuestions as any[]).map((s: any) => [s.id, s]))
  const makeQuestionMap = new Map((makeQuestionsList as any[]).map((m: any) => [m.id, m]))
  const wordMeaningMap = new Map((wordMeanings as any[]).map((w: any) => [w.id, w]))
  const makeSentencesMap = new Map((makeSentencesList as any[]).map((m: any) => [m.id, m]))
  const oppositeWordMap = new Map((oppositeWords as any[]).map((o: any) => [o.id, o]))
  const juktobornoMap = new Map((juktobornos as any[]).map((j: any) => [j.id, { ...j, chapter: j.academicChapter }]))
  const ekKothayProkashMap = new Map((ekKothayProkashs as any[]).map((e: any) => [e.id, { ...e, chapter: e.academicChapter }]))
  const synonymMap = new Map((synonyms as any[]).map((s: any) => [s.id, s]))
  const sadhuToCholitoMap = new Map((sadhuToCholitos as any[]).map((s: any) => [s.id, s]))
  const podNirnoyMap = new Map((podNirnoys as any[]).map((p: any) => [p.id, { ...p, chapter: p.academicChapter }]))
  const verbTenseMap = new Map((verbTenses as any[]).map((v: any) => [v.id, { ...v, chapter: v.academicChapter }]))
  const formFillupMap = new Map((formFillups as any[]).map((f: any) => [f.id, { ...f, chapter: f.academicChapter }]))
  const shuddhoAshuddhoMap = new Map((shuddhoAshuddhos as any[]).map((s: any) => [s.id, { ...s, chapter: s.academicChapter }]))
  const danBamMilkoronMap = new Map((danBamMilkorons as any[]).map((d: any) => [d.id, { ...d, chapter: d.academicChapter }]))
  const subjectMap = new Map(academicSubjects.map((s) => [s.id, s]))
  const qTypeMap = new Map(questionTypes.map((t) => [t.id, t]))

  // Enrich subjects & distributions with main DB data
  const enrichedSubjects = paper.subjects.map((sub) => ({
    ...sub,
    subject: subjectMap.get(sub.subjectId) || null,
    distributions: sub.distributions.map((dist) => ({
      ...dist,
      questionType: qTypeMap.get(dist.questionTypeId) || null,
    })),
  }))

  const distMap = new Map(
    enrichedSubjects.flatMap((s) => s.distributions.map((d: any) => [d.id, d]))
  )

  const enrichSingleQuestion = (q: any): any => {
    let resolvedMcq = q.mcqId ? mcqMap.get(q.mcqId) || null : null
    let resolvedCq = q.cqId ? cqMap.get(q.cqId) || null : null
    let resolvedCs = q.csId ? csMap.get(q.csId) || null : null
    let resolvedShort = q.shortAnswerId ? shortMap.get(q.shortAnswerId) || null : null
    let resolvedPbq = q.pbqId ? pbqMap.get(q.pbqId) || null : null
    let resolvedParagraph = q.paragraphId ? paragraphMap.get(q.paragraphId) || null : null
    let resolvedAmplification = q.amplificationId ? amplificationMap.get(q.amplificationId) || null : null
    let resolvedLetter = q.letterId ? letterMap.get(q.letterId) || null : null
    let resolvedApplication = q.applicationId ? applicationMap.get(q.applicationId) || null : null
    let resolvedSummary = q.summaryId ? summaryMap.get(q.summaryId) || null : null
    let resolvedEssence = q.essenceId ? essenceMap.get(q.essenceId) || null : null
    let resolvedPoemEssence = q.poemEssenceId ? poemEssenceMap.get(q.poemEssenceId) || null : null
    let resolvedProseEssence = q.proseEssenceId ? proseEssenceMap.get(q.proseEssenceId) || null : null
    let resolvedPoem = q.poemId ? poemMap.get(q.poemId) || null : null
    let resolvedNewsReport = q.newsReportId ? newsReportMap.get(q.newsReportId) || null : null
    let resolvedEssay = q.essayId ? essayMap.get(q.essayId) || null : null
    let resolvedPartsOfSpeech = q.partsOfSpeechId ? partsOfSpeechMap.get(q.partsOfSpeechId) || null : null
    let resolvedRightFormOfVerb = q.rightFormOfVerbId ? rightFormOfVerbMap.get(q.rightFormOfVerbId) || null : null
    let resolvedChangingSentence = q.changingSentenceId ? changingSentenceMap.get(q.changingSentenceId) || null : null
    let resolvedFillInTheBlanksWithClues = q.fillInTheBlanksWithCluesId ? fillInTheBlanksWithCluesMap.get(q.fillInTheBlanksWithCluesId) || null : null
    let resolvedFillInTheBlanksWithoutClues = q.fillInTheBlanksWithoutCluesId ? fillInTheBlanksWithoutCluesMap.get(q.fillInTheBlanksWithoutCluesId) || null : null
    let resolvedSubstitutionTable = q.substitutionTableId ? substitutionTableMap.get(q.substitutionTableId) || null : null
    let resolvedPunctuation = q.punctuationId ? punctuationMap.get(q.punctuationId) || null : null
    let resolvedShortComposition = q.shortCompositionId ? shortCompositionMap.get(q.shortCompositionId) || null : null
    let resolvedDescriptiveQuestion = q.descriptiveQuestionId ? descriptiveQuestionMap.get(q.descriptiveQuestionId) || null : null
    let resolvedShortQuestion = q.shortQuestionId ? shortQuestionMap.get(q.shortQuestionId) || null : null
    let resolvedMakeQuestion = q.makeQuestionId ? makeQuestionMap.get(q.makeQuestionId) || null : null
    let resolvedWordMeaning = q.wordMeaningId ? wordMeaningMap.get(q.wordMeaningId) || null : null
    let resolvedMakeSentences = q.makeSentencesId ? makeSentencesMap.get(q.makeSentencesId) || null : null
    let resolvedOppositeWord = q.oppositeWordId ? oppositeWordMap.get(q.oppositeWordId) || null : null
    let resolvedJuktoborno = q.juktobornoId ? juktobornoMap.get(q.juktobornoId) || null : null
    let resolvedEkKothayProkash = q.ekKothayProkashId ? ekKothayProkashMap.get(q.ekKothayProkashId) || null : null
    let resolvedSynonym = q.synonymId ? synonymMap.get(q.synonymId) || null : null
    let resolvedSadhuToCholito = q.sadhuToCholitoId ? sadhuToCholitoMap.get(q.sadhuToCholitoId) || null : null
    let resolvedPodNirnoy = q.podNirnoyId ? podNirnoyMap.get(q.podNirnoyId) || null : null
    let resolvedVerbTense = q.verbTenseId ? verbTenseMap.get(q.verbTenseId) || null : null
    let resolvedFormFillup = q.formFillupId ? formFillupMap.get(q.formFillupId) || null : null
    let resolvedShuddhoAshuddho = q.shuddhoAshuddhoId ? shuddhoAshuddhoMap.get(q.shuddhoAshuddhoId) || null : null
    let resolvedDanBamMilkoron = q.danBamMilkoronId ? danBamMilkoronMap.get(q.danBamMilkoronId) || null : null

    // If published snapshot exists and live wasn't found (or is published), fallback to snapshot
    if (!resolvedMcq && q.mcqId && q.contentSnapshot) {
      resolvedMcq = q.contentSnapshot as any
    }
    if (!resolvedCq && q.cqId && q.contentSnapshot) {
      resolvedCq = q.contentSnapshot as any
    }
    if (!resolvedCs && q.csId && q.contentSnapshot) {
      resolvedCs = q.contentSnapshot as any
    }
    if (!resolvedShort && q.shortAnswerId && q.contentSnapshot) {
      resolvedShort = q.contentSnapshot as any
    }
    if (!resolvedPbq && q.pbqId && q.contentSnapshot) {
      resolvedPbq = q.contentSnapshot as any
    }
    if (!resolvedParagraph && q.paragraphId && q.contentSnapshot) {
      resolvedParagraph = q.contentSnapshot as any
    }
    if (!resolvedAmplification && q.amplificationId && q.contentSnapshot) {
      resolvedAmplification = q.contentSnapshot as any
    }
    if (!resolvedLetter && q.letterId && q.contentSnapshot) {
      resolvedLetter = q.contentSnapshot as any
    }
    if (!resolvedApplication && q.applicationId && q.contentSnapshot) {
      resolvedApplication = q.contentSnapshot as any
    }
    if (!resolvedSummary && q.summaryId && q.contentSnapshot) {
      resolvedSummary = q.contentSnapshot as any
    }
    if (!resolvedEssence && q.essenceId && q.contentSnapshot) {
      resolvedEssence = q.contentSnapshot as any
    }
    if (!resolvedPoemEssence && q.poemEssenceId && q.contentSnapshot) {
      resolvedPoemEssence = q.contentSnapshot as any
    }
    if (!resolvedProseEssence && q.proseEssenceId && q.contentSnapshot) {
      resolvedProseEssence = q.contentSnapshot as any
    }
    if (!resolvedPoem && q.poemId && q.contentSnapshot) {
      resolvedPoem = q.contentSnapshot as any
    }
    if (!resolvedNewsReport && q.newsReportId && q.contentSnapshot) {
      resolvedNewsReport = q.contentSnapshot as any
    }
    if (!resolvedEssay && q.essayId && q.contentSnapshot) {
      resolvedEssay = q.contentSnapshot as any
    }
    if (!resolvedPartsOfSpeech && q.partsOfSpeechId && q.contentSnapshot) {
      resolvedPartsOfSpeech = q.contentSnapshot as any
    }
    if (!resolvedRightFormOfVerb && q.rightFormOfVerbId && q.contentSnapshot) {
      resolvedRightFormOfVerb = q.contentSnapshot as any
    }
    if (!resolvedChangingSentence && q.changingSentenceId && q.contentSnapshot) {
      resolvedChangingSentence = q.contentSnapshot as any
    }
    if (!resolvedFillInTheBlanksWithClues && q.fillInTheBlanksWithCluesId && q.contentSnapshot) {
      resolvedFillInTheBlanksWithClues = q.contentSnapshot as any
    }
    if (!resolvedFillInTheBlanksWithoutClues && q.fillInTheBlanksWithoutCluesId && q.contentSnapshot) {
      resolvedFillInTheBlanksWithoutClues = q.contentSnapshot as any
    }
    if (!resolvedSubstitutionTable && q.substitutionTableId && q.contentSnapshot) {
      resolvedSubstitutionTable = q.contentSnapshot as any
    }
    if (!resolvedPunctuation && q.punctuationId && q.contentSnapshot) {
      resolvedPunctuation = q.contentSnapshot as any
    }
    if (!resolvedShortComposition && q.shortCompositionId && q.contentSnapshot) {
      resolvedShortComposition = q.contentSnapshot as any
    }
    if (!resolvedDescriptiveQuestion && q.descriptiveQuestionId && q.contentSnapshot) {
      resolvedDescriptiveQuestion = q.contentSnapshot as any
    }
    if (!resolvedShortQuestion && q.shortQuestionId && q.contentSnapshot) {
      resolvedShortQuestion = q.contentSnapshot as any
    }
    if (!resolvedMakeQuestion && q.makeQuestionId && q.contentSnapshot) {
      resolvedMakeQuestion = q.contentSnapshot as any
    }
    if (!resolvedWordMeaning && q.wordMeaningId && q.contentSnapshot) {
      resolvedWordMeaning = q.contentSnapshot as any
    }
    if (!resolvedMakeSentences && q.makeSentencesId && q.contentSnapshot) {
      resolvedMakeSentences = q.contentSnapshot as any
    }
    if (!resolvedOppositeWord && q.oppositeWordId && q.contentSnapshot) {
      resolvedOppositeWord = q.contentSnapshot as any
    }
    if (!resolvedJuktoborno && q.juktobornoId && q.contentSnapshot) {
      resolvedJuktoborno = q.contentSnapshot as any
    }
    if (!resolvedEkKothayProkash && q.ekKothayProkashId && q.contentSnapshot) {
      resolvedEkKothayProkash = q.contentSnapshot as any
    }
    if (!resolvedSynonym && q.synonymId && q.contentSnapshot) {
      resolvedSynonym = q.contentSnapshot as any
    }
    if (!resolvedSadhuToCholito && q.sadhuToCholitoId && q.contentSnapshot) {
      resolvedSadhuToCholito = q.contentSnapshot as any
    }
    if (!resolvedPodNirnoy && q.podNirnoyId && q.contentSnapshot) {
      resolvedPodNirnoy = q.contentSnapshot as any
    }
    if (!resolvedVerbTense && q.verbTenseId && q.contentSnapshot) {
      resolvedVerbTense = q.contentSnapshot as any
    }
    if (!resolvedFormFillup && q.formFillupId && q.contentSnapshot) {
      resolvedFormFillup = q.contentSnapshot as any
    }
    if (!resolvedShuddhoAshuddho && q.shuddhoAshuddhoId && q.contentSnapshot) {
      resolvedShuddhoAshuddho = q.contentSnapshot as any
    }
    if (!resolvedDanBamMilkoron && q.danBamMilkoronId && q.contentSnapshot) {
      resolvedDanBamMilkoron = q.contentSnapshot as any
    }

    let resolvedDist = q.distributionId ? distMap.get(q.distributionId) || q.distribution || null : q.distribution || null

    const actualQuestionTypeId =
      (resolvedDanBamMilkoron as any)?.questionTypeId ||
      (resolvedShuddhoAshuddho as any)?.questionTypeId ||
      (resolvedFormFillup as any)?.questionTypeId ||
      (resolvedVerbTense as any)?.questionTypeId ||
      (resolvedPodNirnoy as any)?.questionTypeId ||
      (resolvedSadhuToCholito as any)?.questionTypeId ||
      (resolvedSynonym as any)?.questionTypeId ||
      (resolvedEkKothayProkash as any)?.questionTypeId ||
      (resolvedJuktoborno as any)?.questionTypeId ||
      (resolvedOppositeWord as any)?.questionTypeId ||
      (resolvedMakeSentences as any)?.questionTypeId ||
      (resolvedMakeQuestion as any)?.questionTypeId ||
      (resolvedWordMeaning as any)?.questionTypeId ||
      (resolvedShortQuestion as any)?.questionTypeId ||
      (resolvedShortComposition as any)?.questionTypeId ||
      (resolvedPunctuation as any)?.questionTypeId ||
      (resolvedSubstitutionTable as any)?.questionTypeId ||
      (resolvedFillInTheBlanksWithClues as any)?.questionTypeId ||
      (resolvedFillInTheBlanksWithoutClues as any)?.questionTypeId ||
      (resolvedChangingSentence as any)?.questionTypeId ||
      (resolvedRightFormOfVerb as any)?.questionTypeId ||
      (resolvedPartsOfSpeech as any)?.questionTypeId ||
      (resolvedEssay as any)?.questionTypeId ||
      (resolvedNewsReport as any)?.questionTypeId ||
      (resolvedPoem as any)?.questionTypeId ||
      (resolvedPoemEssence as any)?.questionTypeId ||
      (resolvedProseEssence as any)?.questionTypeId ||
      (resolvedEssence as any)?.questionTypeId ||
      (resolvedSummary as any)?.questionTypeId ||
      (resolvedParagraph as any)?.questionTypeId ||
      (resolvedLetter as any)?.questionTypeId ||
      (resolvedApplication as any)?.questionTypeId ||
      (resolvedAmplification as any)?.questionTypeId ||
      (resolvedPbq as any)?.questionTypeId ||
      (resolvedCq as any)?.questionTypeId ||
      (resolvedShort as any)?.questionTypeId

    if (actualQuestionTypeId && resolvedDist && resolvedDist.questionTypeId !== actualQuestionTypeId) {
      for (const dist of distMap.values()) {
        const matchesExact = dist.questionTypeId === actualQuestionTypeId
        const matchesCategory =
          (resolvedDanBamMilkoron && (dist.questionTypeName?.includes("মিলকরণ") || dist.questionTypeName?.includes("বাম-ডান") || dist.questionTypeName?.includes("ডান-বাম") || dist.questionTypeName?.toLowerCase().includes("dan bam") || dist.questionTypeName?.toLowerCase().includes("dan_bam") || dist.questionTypeName?.toLowerCase().includes("matching"))) ||
          (resolvedShuddhoAshuddho && (dist.questionTypeName?.includes("শুদ্ধ-অশুদ্ধ") || dist.questionTypeName?.includes("শুদ্ধ") || dist.questionTypeName?.toLowerCase().includes("shuddho") || dist.questionTypeName?.toLowerCase().includes("shuddho_ashuddho"))) ||
          (resolvedFormFillup && (dist.questionTypeName?.includes("ফরম পূরণ") || dist.questionTypeName?.includes("ফরমপুরণ") || dist.questionTypeName?.toLowerCase().includes("form fillup") || dist.questionTypeName?.toLowerCase().includes("form_fillup") || dist.questionTypeName?.toLowerCase().includes("form filling") || dist.questionTypeName?.toLowerCase().includes("form_filling"))) ||
          (resolvedVerbTense && (dist.questionTypeName?.includes("ক্রিয়াপদ") || dist.questionTypeName?.includes("ক্রিয়াপদ") || dist.questionTypeName?.includes("ক্রিয়ার কাল") || dist.questionTypeName?.includes("ক্রিয়ার কাল") || dist.questionTypeName?.toLowerCase().includes("verb tense") || dist.questionTypeName?.toLowerCase().includes("verb_tense"))) ||
          (resolvedPodNirnoy && (dist.questionTypeName?.includes("পদ নির্ণয়") || dist.questionTypeName?.includes("পদ নির্ণয়") || dist.questionTypeName?.toLowerCase().includes("pod nirnoy") || dist.questionTypeName?.toLowerCase().includes("pod_nirnoy"))) ||
          (resolvedSadhuToCholito && (dist.questionTypeName?.includes("সাধু") || dist.questionTypeName?.includes("চলিত") || dist.questionTypeName?.toLowerCase().includes("sadhu"))) ||
          (resolvedSynonym && (dist.questionTypeName?.includes("সমার্থক") || dist.questionTypeName?.includes("প্রতিশব্দ") || dist.questionTypeName?.toLowerCase().includes("synonym"))) ||
          (resolvedEkKothayProkash && (dist.questionTypeName?.includes("এক কথায়") || dist.questionTypeName?.includes("এক কথায়") || dist.questionTypeName?.toLowerCase().includes("ek kothay") || dist.questionTypeName?.toLowerCase().includes("ek kothai"))) ||
          (resolvedJuktoborno && (dist.questionTypeName?.includes("যুক্তবর্ণ") || dist.questionTypeName?.toLowerCase().includes("juktoborno"))) ||
          (resolvedOppositeWord && (dist.questionTypeName?.includes("বিপরীত") || dist.questionTypeName?.toLowerCase().includes("opposite word") || dist.questionTypeName?.toLowerCase().includes("opposite_word"))) ||
          (resolvedMakeSentences && (dist.questionTypeName?.includes("বাক্য তৈরি") || dist.questionTypeName?.toLowerCase().includes("make sentence") || dist.questionTypeName?.toLowerCase().includes("make_sentence"))) ||
          (resolvedMakeQuestion && (dist.questionTypeName?.includes("প্রশ্ন তৈরি") || dist.questionTypeName?.toLowerCase().includes("make question") || dist.questionTypeName?.toLowerCase().includes("make_question") || dist.questionTypeName?.toLowerCase().includes("wh question") || dist.questionTypeName?.toLowerCase().includes("wh_question"))) ||
          (resolvedWordMeaning && (dist.questionTypeName?.includes("শব্দার্থ") || dist.questionTypeName?.toLowerCase().includes("word meaning") || dist.questionTypeName?.toLowerCase().includes("word_meaning"))) ||
          (resolvedShortQuestion && (dist.questionTypeName?.toLowerCase().includes("short question") || dist.questionTypeName?.includes("সংক্ষিপ্ত প্রশ্ন") || dist.questionTypeName?.toLowerCase().includes("short"))) ||
          (resolvedShortComposition && (dist.questionTypeName?.toLowerCase().includes("composition") || dist.questionTypeName?.toLowerCase().includes("short composition") || dist.questionTypeName?.includes("কম্পোজিশন") || dist.questionTypeName?.includes("শর্ট কম্পোজিশন"))) ||
          (resolvedPunctuation && (dist.questionTypeName?.toLowerCase().includes("punctuation") || dist.questionTypeName?.toLowerCase().includes("capitalization") || dist.questionTypeName?.toLowerCase().includes("capital letter") || dist.questionTypeName?.includes("বিরাম চিহ্ন") || dist.questionTypeName?.includes("যতিচিহ্ন"))) ||
          (resolvedSubstitutionTable && (dist.questionTypeName?.toLowerCase().includes("substitution table") || dist.questionTypeName?.includes("সাবস্টিটিউশন টেবিল"))) ||
          (resolvedFillInTheBlanksWithClues && (dist.questionTypeName?.toLowerCase().includes("fill in the blanks") || dist.questionTypeName?.toLowerCase().includes("with clues") || dist.questionTypeName?.includes("ক্লুসহ"))) ||
          (resolvedFillInTheBlanksWithoutClues && (dist.questionTypeName?.toLowerCase().includes("without clues") || dist.questionTypeName?.toLowerCase().includes("without clue") || dist.questionTypeName?.includes("ক্লু ছাড়া") || dist.questionTypeName?.includes("ক্লু ছাড়া"))) ||
          (resolvedChangingSentence && (dist.questionTypeName?.toLowerCase().includes("changing sentence") || dist.questionTypeName?.toLowerCase().includes("changing sentences") || dist.questionTypeName?.toLowerCase().includes("change the sentence") || dist.questionTypeName?.toLowerCase().includes("directed in bracket") || dist.questionTypeName?.includes("বাক্য রূপান্তর") || dist.questionTypeName?.includes("বাক্য পরিবর্তন"))) ||
          (resolvedRightFormOfVerb && (dist.questionTypeName?.toLowerCase().includes("right form") || dist.questionTypeName?.toLowerCase().includes("verbs in brackets") || dist.questionTypeName?.includes("ভার্ব") || dist.questionTypeName?.toLowerCase().includes("verb"))) ||
          (resolvedPartsOfSpeech && (dist.questionTypeName?.toLowerCase().includes("parts of speech") || dist.questionTypeName?.toLowerCase().includes("part of speech"))) ||
          (resolvedEssay && (dist.questionTypeName?.includes("রচনা") || dist.questionTypeName?.toLowerCase().includes("essay"))) ||
          (resolvedNewsReport && (dist.questionTypeName?.includes("প্রতিবেদন") || dist.questionTypeName?.toLowerCase().includes("report"))) ||
          (resolvedPoemEssence && (dist.questionTypeName?.includes("কবিতার মূলভাব") || dist.questionTypeName?.toLowerCase().includes("poem essence") || dist.questionTypeName?.toLowerCase().includes("poem_essence"))) ||
          (resolvedProseEssence && (dist.questionTypeName?.includes("গদ্য") || dist.questionTypeName?.toLowerCase().includes("prose essence") || dist.questionTypeName?.toLowerCase().includes("prose_essence"))) ||
          (resolvedEssence && (dist.questionTypeName?.includes("সারমর্ম") || dist.questionTypeName?.toLowerCase().includes("essence"))) ||
          (resolvedPoem && (dist.questionTypeName?.includes("কবিতা") || dist.questionTypeName?.toLowerCase().includes("poem"))) ||
          (resolvedSummary && (dist.questionTypeName?.includes("সারাংশ") || dist.questionTypeName?.toLowerCase().includes("summary"))) ||
          (resolvedParagraph && (dist.questionTypeName?.includes("অনুচ্ছেদ") || dist.questionTypeName?.toLowerCase().includes("paragraph"))) ||
          (resolvedLetter && (dist.questionTypeName?.includes("চিঠি") || dist.questionTypeName?.includes("পত্র") || dist.questionTypeName?.toLowerCase().includes("letter"))) ||
          (resolvedApplication && (dist.questionTypeName?.includes("আবেদন") || dist.questionTypeName?.includes("দরখাস্ত") || dist.questionTypeName?.toLowerCase().includes("application"))) ||
          (resolvedAmplification && (dist.questionTypeName?.includes("ভাব-সম্প্রসারণ") || dist.questionTypeName?.toLowerCase().includes("amplification"))) ||
          (resolvedPbq && (dist.questionTypeName?.includes("অনুচ্ছেদভিত্তিক") || dist.questionTypeName?.toLowerCase().includes("pbq") || dist.questionTypeName?.toLowerCase().includes("passage"))) ||
          (resolvedShort && (dist.questionTypeName?.includes("সংক্ষিপ্ত") || dist.questionTypeName?.toLowerCase().includes("short"))) ||
          (resolvedCq && (dist.questionTypeName?.includes("সৃজনশীল") || dist.questionTypeName?.toLowerCase().includes("cq")))

        if (matchesExact || matchesCategory) {
          resolvedDist = dist
          break
        }
      }
    }

    return {
      ...q,
      distribution: resolvedDist,
      distributionId: resolvedDist?.id || q.distributionId,
      mcq: resolvedMcq,
      cq: resolvedCq,
      cs: resolvedCs,
      shortAnswer: resolvedShort,
      pbq: resolvedPbq,
      paragraph: resolvedParagraph,
      amplification: resolvedAmplification,
      letter: resolvedLetter,
      application: resolvedApplication,
      summary: resolvedSummary,
      essence: resolvedEssence,
      poemEssence: resolvedPoemEssence,
      proseEssence: resolvedProseEssence,
      poem: resolvedPoem,
      newsReport: resolvedNewsReport,
      essay: resolvedEssay,
      partsOfSpeech: resolvedPartsOfSpeech,
      rightFormOfVerb: resolvedRightFormOfVerb,
      changingSentence: resolvedChangingSentence,
      fillInTheBlanksWithClues: resolvedFillInTheBlanksWithClues,
      fillInTheBlanksWithoutClues: resolvedFillInTheBlanksWithoutClues,
      substitutionTable: resolvedSubstitutionTable,
      punctuation: resolvedPunctuation,
      shortComposition: resolvedShortComposition,
      descriptiveQuestion: resolvedDescriptiveQuestion,
      shortQuestion: resolvedShortQuestion,
      makeQuestion: resolvedMakeQuestion,
      wordMeaning: resolvedWordMeaning,
      makeSentences: resolvedMakeSentences,
      oppositeWord: resolvedOppositeWord,
      juktoborno: resolvedJuktoborno,
      ekKothayProkash: resolvedEkKothayProkash,
      synonym: resolvedSynonym,
      sadhuToCholito: resolvedSadhuToCholito,
      podNirnoy: resolvedPodNirnoy,
      verbTense: resolvedVerbTense,
      formFillup: resolvedFormFillup,
      shuddhoAshuddho: resolvedShuddhoAshuddho,
      danBamMilkoron: resolvedDanBamMilkoron,
      alternatives: (q.alternatives || []).map(enrichSingleQuestion),
    }
  }

  // Enrich questions with resolved entity
  const enrichedQuestions = paper.questions.map(enrichSingleQuestion)

  return {
    ...paper,
    academicClass,
    subjects: enrichedSubjects,
    questions: enrichedQuestions,
  }
}

export async function createQuestionPaper(
  tenantDb: TenantPrismaClient,
  input: CreateQuestionPaperInput,
  actorId?: string
) {
  const paper = await tenantDb.questionPaper.create({
    data: {
      title: input.title,
      examName: input.examName,
      description: input.description,
      classId: input.classId,
      className: input.className,
      settings: input.settings,
      instructions: input.instructions,
      isTemplate: input.isTemplate,
      timeInMinutes: input.timeInMinutes,
      status: "Draft",
    },
  })

  await logHistory(tenantDb, {
    questionPaperId: paper.id,
    action: "CREATED",
    actorId,
    changes: { after: paper },
  })

  return paper
}

export async function createQuestionPaperFull(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: CreateQuestionPaperFullInput,
  actorId?: string
) {
  // 1. Create the paper
  const paper = await tenantDb.questionPaper.create({
    data: {
      title: input.title,
      examName: input.examName,
      description: input.description,
      classId: input.classId,
      className: input.className,
      settings: input.settings,
      instructions: input.instructions,
      isTemplate: input.isTemplate,
      timeInMinutes: input.timeInMinutes,
      status: "Draft",
      createdBy: actorId,
    },
  })

  if (input.subjects.length === 0) {
    await logHistory(tenantDb, {
      questionPaperId: paper.id,
      action: "CREATED",
      actorId,
      changes: { after: paper },
    })
    return paper
  }

  // 2. Batch-fetch all subject question structures from main DB upfront
  const allSubjectIds = input.subjects.map((s) => s.subjectId)
  const allQuestionTypeIds = Array.from(
    new Set(input.subjects.flatMap((s) => s.distributions.map((d) => d.questionTypeId)))
  )

  const [mainSectionsAll, questionTypesAll] = await Promise.all([
    db.subjectQuestionSection.findMany({
      where: { subjectId: { in: allSubjectIds } },
      include: {
        subSections: {
          include: { subjectQuestionTypes: true },
          orderBy: { position: "asc" },
        },
        subjectQuestionTypes: true,
      },
      orderBy: { position: "asc" },
    }),
    allQuestionTypeIds.length > 0
      ? db.questionType.findMany({ where: { id: { in: allQuestionTypeIds } } })
      : [],
  ])

  const qTypeMap = new Map(questionTypesAll.map((t) => [t.id, t]))
  const mainSectionsBySubject = new Map<string, typeof mainSectionsAll>()
  for (const sec of mainSectionsAll) {
    const arr = mainSectionsBySubject.get(sec.subjectId) || []
    arr.push(sec)
    mainSectionsBySubject.set(sec.subjectId, arr)
  }

  let paperTotal = 0

  // 3. Process each subject + distributions + auto-create sections
  for (let i = 0; i < input.subjects.length; i++) {
    const subjectInput = input.subjects[i]!

    const createdSubject = await tenantDb.questionPaperSubject.create({
      data: {
        questionPaperId: paper.id,
        subjectId: subjectInput.subjectId,
        subjectName: subjectInput.subjectName,
        orderIndex: subjectInput.orderIndex ?? i,
        subjectTotal: 0,
      },
    })

    // Auto-create sections from main DB structure
    const mainSections = mainSectionsBySubject.get(subjectInput.subjectId) || []
    const definedTypeIds = subjectInput.questionTypeIds && subjectInput.questionTypeIds.length > 0
      ? new Set(subjectInput.questionTypeIds)
      : null

    for (const mSec of mainSections) {
      let shouldCreateSection = true
      let validSubSectionsToCreate = mSec.subSections

      if (definedTypeIds) {
        const secTypeIds = mSec.subjectQuestionTypes.map((sqt) => sqt.questionTypeId)
        const hasDirectMatch = secTypeIds.some((id) => definedTypeIds.has(id))

        validSubSectionsToCreate = mSec.subSections.filter((mSub) => {
          const subTypeIds = mSub.subjectQuestionTypes.map((sqt) => sqt.questionTypeId)
          if (subTypeIds.length > 0) {
            return subTypeIds.some((id) => definedTypeIds.has(id))
          }
          return hasDirectMatch
        })

        const hasSubMatch = validSubSectionsToCreate.length > 0
        const totalLinkedTypes = secTypeIds.length + mSec.subSections.reduce((sum, s) => sum + s.subjectQuestionTypes.length, 0)

        if (totalLinkedTypes > 0 && !hasDirectMatch && !hasSubMatch) {
          shouldCreateSection = false
        }
      }

      if (!shouldCreateSection) continue

      const pSection = await tenantDb.questionPaperSection.create({
        data: {
          questionPaperId: paper.id,
          title: mSec.nameEn || mSec.nameBn || "Section",
          titleBn: mSec.nameBn,
          orderIndex: mSec.position,
          instructions: mSec.instructions ?? null,
          questionsToAttempt: null,
        },
      })

      // Batch-create sub-sections
      if (validSubSectionsToCreate.length > 0) {
        const typeCounts = new Map<string, number>()
        if (subjectInput.questionTypeIds) {
          for (const tid of subjectInput.questionTypeIds) {
            typeCounts.set(tid, (typeCounts.get(tid) || 0) + 1)
          }
        }

        const subSectionsToCreate: Array<{
          sectionId: string
          title: string
          titleBn: string | null
          orderIndex: number
          instructions: string | null
          questionsToAttempt: number
        }> = []

        for (const mSub of validSubSectionsToCreate) {
          const subTypeIds = mSub.subjectQuestionTypes.map((sqt) => sqt.questionTypeId)
          let requiredInstances = 1
          if (subjectInput.questionTypeIds && subTypeIds.length > 0) {
            const matchingCounts = subTypeIds.map((tid) => typeCounts.get(tid) || 0)
            const maxCount = Math.max(...matchingCounts)
            if (maxCount > 0) requiredInstances = maxCount
          }

          for (let idx = 0; idx < requiredInstances; idx++) {
            subSectionsToCreate.push({
              sectionId: pSection.id,
              title: mSub.nameEn || mSub.nameBn || "Sub-section",
              titleBn: mSub.nameBn,
              orderIndex: mSub.position + idx,
              instructions: mSub.instructions ?? null,
              questionsToAttempt: 0,
            })
          }
        }

        if (subSectionsToCreate.length > 0) {
          await tenantDb.questionPaperSubSection.createMany({
            data: subSectionsToCreate,
          })
        }
      }
    }

    // Create distributions for this subject
    let subjectTotal = 0

    for (const distInput of subjectInput.distributions) {
      const sqType = await db.subjectQuestionType.findFirst({
        where: {
          subjectId: subjectInput.subjectId,
          questionTypeId: distInput.questionTypeId,
        },
        include: { section: true, subSection: true },
      })

      const qType = qTypeMap.get(distInput.questionTypeId)
      const questionTypeName = qType?.nameEn || qType?.nameBn || distInput.questionTypeName
      const questionTypeNameBn = qType?.nameBn || distInput.questionTypeNameBn || null
      const questionTypeLabel =
        distInput.questionTypeLabel ||
        sqType?.customLabel ||
        qType?.label ||
        qType?.nameBn ||
        qType?.nameEn ||
        null

      const markDistribution = syncMarkDistribution(
        distInput.marksPerQuestion,
        distInput.markDistribution,
        sqType?.markDistribution
      )

      const attemptCount = distInput.questionsToAttempt ?? distInput.questionCount
      const totalMarks = distInput.marksPerQuestion * attemptCount

      let sectionId: string | null = null
      if (sqType?.section) {
        const pSec = await tenantDb.questionPaperSection.findFirst({
          where: {
            questionPaperId: paper.id,
            title: sqType.section.nameEn || sqType.section.nameBn || "",
            titleBn: sqType.section.nameBn,
          },
        })
        if (pSec) sectionId = pSec.id
      }

      const dist = await tenantDb.questionPaperSubjectMarkDistribution.create({
        data: {
          paperSubjectId: createdSubject.id,
          questionTypeId: distInput.questionTypeId,
          questionTypeName,
          questionTypeNameBn,
          questionTypeLabel,
          marksPerQuestion: distInput.marksPerQuestion,
          markDistribution: markDistribution as any,
          questionCount: distInput.questionCount,
          totalMarks,
          questionsToAttempt: distInput.questionsToAttempt ?? distInput.questionCount,
          orderIndex: distInput.orderIndex,
          sectionId,
        },
      })

      if (sectionId && sqType?.subSection) {
        const candidateSubs = await tenantDb.questionPaperSubSection.findMany({
          where: {
            sectionId,
            title: sqType.subSection.nameEn || sqType.subSection.nameBn || "",
            titleBn: sqType.subSection.nameBn,
          },
          orderBy: { orderIndex: "asc" },
        })

        for (const sub of candidateSubs) {
          await tenantDb.questionPaperSubSectionDistribution.upsert({
            where: {
              subSectionId_distributionId: {
                subSectionId: sub.id,
                distributionId: dist.id,
              },
            },
            create: { subSectionId: sub.id, distributionId: dist.id },
            update: {},
          }).catch(() => { })
        }
      }

      if (sectionId) {
        const secSubs = await tenantDb.questionPaperSubSection.findMany({
          where: { sectionId },
          select: { questionsToAttempt: true },
        })
        const secAttemptSum = secSubs.reduce((sum, s) => sum + (s.questionsToAttempt || 0), 0)
        if (secAttemptSum > 0) {
          await tenantDb.questionPaperSection.update({
            where: { id: sectionId },
            data: { questionsToAttempt: secAttemptSum },
          }).catch(() => { })
        }
      }

      subjectTotal += totalMarks
    }

    await tenantDb.questionPaperSubject.update({
      where: { id: createdSubject.id },
      data: { subjectTotal },
    })

    paperTotal += subjectTotal
  }

  await tenantDb.questionPaper.update({
    where: { id: paper.id },
    data: { total: paperTotal },
  })

  await logHistory(tenantDb, {
    questionPaperId: paper.id,
    action: "CREATED",
    actorId,
    changes: {
      after: paper,
      subjectsCount: input.subjects.length,
      distributionsCount: input.subjects.reduce((sum, s) => sum + s.distributions.length, 0),
    },
  })

  return paper
}

export async function updateQuestionPaper(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: UpdateQuestionPaperInput,
  actorId?: string
) {
  const { id, ...data } = input
  const existing = await tenantDb.questionPaper.findUnique({
    where: { id },
  })

  if (!existing || existing.deletedAt) {
    throw notFound("QuestionPaper")
  }

  const updateData: any = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.examName !== undefined) updateData.examName = data.examName
  if (data.description !== undefined) updateData.description = data.description
  if (data.classId !== undefined) updateData.classId = data.classId
  if (data.className !== undefined) updateData.className = data.className
  if (data.settings !== undefined) updateData.settings = data.settings
  if (data.instructions !== undefined) updateData.instructions = data.instructions
  if (data.isTemplate !== undefined) updateData.isTemplate = data.isTemplate
  if (data.isActive !== undefined) updateData.isActive = data.isActive
  if (data.status !== undefined) updateData.status = data.status
  if (data.timeInMinutes !== undefined) updateData.timeInMinutes = data.timeInMinutes

  const updated = await tenantDb.questionPaper.update({
    where: { id },
    data: updateData,
  })

  let action = "SETTINGS_UPDATED"
  if (data.status === "Published" && existing.status !== "Published") {
    action = "PUBLISHED"
    await freezeQuestionSnapshots(db, tenantDb, id)
  } else if (data.status === "Draft" && existing.status === "Published") {
    action = "UNPUBLISHED"
  } else if (data.isTemplate && !existing.isTemplate) {
    action = "TEMPLATE_CREATED"
  }

  await logHistory(tenantDb, {
    questionPaperId: id,
    action,
    actorId,
    changes: { before: existing, after: updated },
  })

  return updated
}

export async function deleteQuestionPaper(
  tenantDb: TenantPrismaClient,
  input: DeleteQuestionPaperInput,
  actorId?: string
) {
  const existing = await tenantDb.questionPaper.findUnique({
    where: { id: input.id },
  })

  if (!existing || existing.deletedAt) {
    throw notFound("QuestionPaper")
  }

  if (existing.status === "Published") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Published question papers cannot be deleted directly. Unpublish the paper first.",
    })
  }

  const updated = await tenantDb.questionPaper.update({
    where: { id: input.id },
    data: {
      deletedAt: new Date(),
      isActive: false,
      deletedBy: actorId,
    },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.id,
    action: "DELETED",
    actorId,
    changes: { deletedAt: updated.deletedAt },
  })

  return { success: true }
}

export async function duplicateQuestionPaper(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: DuplicateQuestionPaperInput,
  actorId?: string
) {
  const source = await tenantDb.questionPaper.findUnique({
    where: { id: input.id },
    include: {
      subjects: {
        include: {
          distributions: true,
        },
      },
      sections: true,
      questions: {
        where: { parentQuestionId: null },
        include: {
          alternatives: true,
        },
      },
    },
  })

  if (!source || source.deletedAt) {
    throw notFound("QuestionPaper")
  }

  const duplicate = await tenantDb.questionPaper.create({
    data: {
      title: `${source.title} (Copy)`,
      examName: source.examName,
      description: source.description,
      classId: source.classId,
      className: source.className,
      settings: source.settings ?? {},
      instructions: source.instructions ?? [],
      isTemplate: false,
      status: "Draft",
      total: source.total,
      timeInMinutes: source.timeInMinutes,
      createdBy: actorId,
    },
  })

  const sectionIdMap = new Map<string, string>()
  for (const section of source.sections) {
    const newSection = await tenantDb.questionPaperSection.create({
      data: {
        questionPaperId: duplicate.id,
        title: section.title,
        titleBn: section.titleBn,
        instructions: section.instructions,
        orderIndex: section.orderIndex,
      },
    })
    sectionIdMap.set(section.id, newSection.id)
  }

  const distIdMap = new Map<string, string>()
  for (const subject of source.subjects) {
    const newSubject = await tenantDb.questionPaperSubject.create({
      data: {
        questionPaperId: duplicate.id,
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        subjectTotal: subject.subjectTotal,
      },
    })

    for (const dist of subject.distributions) {
      const newDist = await tenantDb.questionPaperSubjectMarkDistribution.create({
        data: {
          paperSubjectId: newSubject.id,
          questionTypeId: dist.questionTypeId,
          questionTypeName: dist.questionTypeName,
          questionTypeNameBn: (dist as any).questionTypeNameBn ?? null,
          questionTypeLabel: (dist as any).questionTypeLabel ?? null,
          marksPerQuestion: dist.marksPerQuestion,
          markDistribution: (dist.markDistribution as any) ?? undefined,
          questionCount: dist.questionCount,
          totalMarks: dist.totalMarks,
          questionsToAttempt: dist.questionsToAttempt,
          orderIndex: dist.orderIndex,
        },
      })
      distIdMap.set(dist.id, newDist.id)
    }
  }

  for (const question of source.questions) {
    const newDistId = distIdMap.get(question.distributionId)
    if (!newDistId) continue

    const newSectionId = question.sectionId ? sectionIdMap.get(question.sectionId) : null

    const createdPrimary = await tenantDb.questionPaperQuestion.create({
      data: {
        questionPaperId: duplicate.id,
        mcqId: question.mcqId,
        cqId: question.cqId,
        csId: question.csId,
        shortAnswerId: question.shortAnswerId,
        paragraphId: question.paragraphId,
        amplificationId: question.amplificationId,
        letterId: question.letterId,
        applicationId: question.applicationId,
        summaryId: question.summaryId,
        essenceId: question.essenceId,
        poemId: question.poemId,
        essayId: question.essayId,
        newsReportId: question.newsReportId,
        partsOfSpeechId: question.partsOfSpeechId,
        rightFormOfVerbId: question.rightFormOfVerbId,
        changingSentenceId: question.changingSentenceId,
        fillInTheBlanksWithCluesId: question.fillInTheBlanksWithCluesId,
        fillInTheBlanksWithoutCluesId: question.fillInTheBlanksWithoutCluesId,
        substitutionTableId: question.substitutionTableId,
        punctuationId: question.punctuationId,
        shortCompositionId: question.shortCompositionId,
        shortQuestionId: question.shortQuestionId,
        distributionId: newDistId,
        sectionId: newSectionId,
        orderIndex: question.orderIndex,
        assignedMarks: question.assignedMarks,
        overrides: question.overrides ?? {},
        contentSnapshot: question.contentSnapshot as any,
      },
    })

    if (question.alternatives && question.alternatives.length > 0) {
      for (const alt of question.alternatives) {
        const altDistId = distIdMap.get(alt.distributionId) || newDistId
        await tenantDb.questionPaperQuestion.create({
          data: {
            questionPaperId: duplicate.id,
            parentQuestionId: createdPrimary.id,
            mcqId: alt.mcqId,
            cqId: alt.cqId,
            csId: alt.csId,
            shortAnswerId: alt.shortAnswerId,
            paragraphId: alt.paragraphId,
            amplificationId: alt.amplificationId,
            letterId: alt.letterId,
            applicationId: alt.applicationId,
            summaryId: alt.summaryId,
            essenceId: alt.essenceId,
            poemId: alt.poemId,
            essayId: alt.essayId,
            newsReportId: alt.newsReportId,
            partsOfSpeechId: alt.partsOfSpeechId,
            rightFormOfVerbId: alt.rightFormOfVerbId,
            changingSentenceId: alt.changingSentenceId,
            fillInTheBlanksWithCluesId: alt.fillInTheBlanksWithCluesId,
            fillInTheBlanksWithoutCluesId: alt.fillInTheBlanksWithoutCluesId,
            substitutionTableId: alt.substitutionTableId,
            punctuationId: alt.punctuationId,
            shortCompositionId: alt.shortCompositionId,
            shortQuestionId: alt.shortQuestionId,
            distributionId: altDistId,
            sectionId: newSectionId,
            orderIndex: alt.orderIndex,
            assignedMarks: alt.assignedMarks,
            orLabel: alt.orLabel || "অথবা",
            orOrder: alt.orOrder,
            overrides: alt.overrides ?? {},
            contentSnapshot: alt.contentSnapshot as any,
          },
        })
      }
    }
  }

  await logHistory(tenantDb, {
    questionPaperId: duplicate.id,
    action: "CREATED",
    actorId,
    changes: { duplicateOf: source.id },
  })

  return duplicate
}

export async function getQuestionPaperHistory(
  tenantDb: TenantPrismaClient,
  input: GetQuestionPaperInput
) {
  return tenantDb.questionPaperHistory.findMany({
    where: { questionPaperId: input.id },
    orderBy: { createdAt: "desc" },
  })
}

export async function updateQuestionPaperSettings(
  tenantDb: TenantPrismaClient,
  input: UpdateQuestionPaperSettingsInput,
  actorId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.id },
  })
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper")

  const updated = await tenantDb.questionPaper.update({
    where: { id: input.id },
    data: {
      settings: input.settings,
    },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.id,
    action: "SETTINGS_UPDATED",
    actorId,
    changes: { settings: input.settings },
  })

  return updated
}
