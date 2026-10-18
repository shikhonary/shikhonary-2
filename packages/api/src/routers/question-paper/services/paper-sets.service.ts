import type { PrismaClient } from "@workspace/db/main"
import type { TenantPrismaClient } from "@workspace/db/tenant"
import { notFound } from "../../../utils/errors"
import type { GeneratePaperSetsInput } from "../question-paper.schema"
import { logHistory } from "./helpers/history-logger"
import { getQuestionPaperById } from "./paper-core.service"

export async function generatePaperSets(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: GeneratePaperSetsInput,
  actorId?: string
) {
  const source = await getQuestionPaperById(db, tenantDb, { id: input.sourcePaperId })
  if (!source) throw notFound("QuestionPaper")

  const generatedPapers: Array<{ id: string; title: string; setCode: string }> = []

  const cleanBaseTitle = source.title.replace(/\s*\(সেট\s*[^)]+\)$/, "").trim()

  const firstSetCode = input.setCodes[0] || "ক"
  const firstSetTitle = `${cleanBaseTitle} (সেট ${firstSetCode})`

  // 1. Update the original paper to become the first set (Set A / Set ক) and publish it
  const updatedOriginalSettings = {
    ...((source.settings as any) || {}),
    setCode: firstSetCode,
    showSetCode: true,
  }

  await tenantDb.questionPaper.update({
    where: { id: source.id },
    data: {
      title: firstSetTitle,
      status: "Published",
      settings: updatedOriginalSettings,
    },
  })

  await logHistory(tenantDb, {
    questionPaperId: source.id,
    action: "UPDATED",
    actorId,
    changes: {
      title: firstSetTitle,
      status: "Published",
      setCode: firstSetCode,
      isOriginalSet: true,
    },
  })

  generatedPapers.push({
    id: source.id,
    title: firstSetTitle,
    setCode: firstSetCode,
  })

  // 2. Only generate the remaining sets (e.g. if 2 sets: only 1 new set for "খ", not 2 new sets)
  const remainingSetCodes = input.setCodes.slice(1)

  for (const setCode of remainingSetCodes) {
    const newSettings = {
      ...((source.settings as any) || {}),
      setCode,
      showSetCode: true,
    }

    const createdPaper = await tenantDb.questionPaper.create({
      data: {
        title: `${cleanBaseTitle} (সেট ${setCode})`,
        examName: source.examName,
        description: source.description,
        classId: source.classId,
        className: source.className,
        settings: newSettings,
        instructions: source.instructions ?? [],
        isTemplate: false,
        status: "Published",
        total: source.total,
        timeInMinutes: source.timeInMinutes,
        createdBy: actorId,
      },
    })

    const sectionMap = new Map<string, string>()
    for (const sec of source.sections) {
      const newSec = await tenantDb.questionPaperSection.create({
        data: {
          questionPaperId: createdPaper.id,
          title: sec.title,
          titleBn: sec.titleBn,
          instructions: sec.instructions,
          orderIndex: sec.orderIndex,
        },
      })
      sectionMap.set(sec.id, newSec.id)
    }

    const distMap = new Map<string, string>()
    for (const sub of source.subjects) {
      const newSub = await tenantDb.questionPaperSubject.create({
        data: {
          questionPaperId: createdPaper.id,
          subjectId: sub.subjectId,
          subjectName: sub.subjectName,
          subjectTotal: sub.subjectTotal,
        },
      })

      for (const dist of sub.distributions) {
        const newDist = await tenantDb.questionPaperSubjectMarkDistribution.create({
          data: {
            paperSubjectId: newSub.id,
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
        distMap.set(dist.id, newDist.id)
      }
    }

    const questionsByDist = new Map<string, any[]>()
    for (const q of source.questions) {
      const arr = questionsByDist.get(q.distributionId) || []
      arr.push(q)
      questionsByDist.set(q.distributionId, arr)
    }

    let globalOrder = 0
    for (const [oldDistId, qList] of questionsByDist.entries()) {
      const newDistId = distMap.get(oldDistId)
      if (!newDistId) continue

      let processedList = [...qList]
      if (input.shuffleQuestions) {
        for (let i = processedList.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
            ;[processedList[i], processedList[j]] = [processedList[j]!, processedList[i]!]
        }
      }

      for (const q of processedList) {
        const newSecId = q.sectionId ? sectionMap.get(q.sectionId) : null
        let overrides = { ...(q.overrides || {}) }

        if (input.shuffleOptions && q.mcq && q.mcq.options && q.mcq.options.length > 1) {
          const originalOptions: string[] = q.mcq.options
          const indexed = originalOptions.map((opt, i) => ({ opt, originalIndex: i }))
          for (let i = indexed.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
              ;[indexed[i], indexed[j]] = [indexed[j]!, indexed[i]!]
          }
          overrides.shuffledOptions = indexed.map((item) => item.opt)
        }

        const createdPrimary = await tenantDb.questionPaperQuestion.create({
          data: {
            questionPaperId: createdPaper.id,
            mcqId: q.mcqId,
            cqId: q.cqId,
            csId: q.csId,
            shortAnswerId: q.shortAnswerId,
            paragraphId: q.paragraphId,
            amplificationId: q.amplificationId,
            letterId: q.letterId,
            applicationId: q.applicationId,
            summaryId: q.summaryId,
            essenceId: q.essenceId,
            poemEssenceId: q.poemEssenceId,
            proseEssenceId: q.proseEssenceId,
            poemId: q.poemId,
            essayId: q.essayId,
            newsReportId: q.newsReportId,
            partsOfSpeechId: q.partsOfSpeechId,
            rightFormOfVerbId: q.rightFormOfVerbId,
            changingSentenceId: q.changingSentenceId,
            fillInTheBlanksWithCluesId: q.fillInTheBlanksWithCluesId,
            fillInTheBlanksWithoutCluesId: q.fillInTheBlanksWithoutCluesId,
            substitutionTableId: q.substitutionTableId,
            punctuationId: q.punctuationId,
            shortCompositionId: q.shortCompositionId,
            descriptiveQuestionId: q.descriptiveQuestionId,
            shortQuestionId: q.shortQuestionId,
            makeQuestionId: q.makeQuestionId,
            wordMeaningId: q.wordMeaningId,
            numberInWordsId: q.numberInWordsId,
            makeSentencesId: q.makeSentencesId,
            oppositeWordId: q.oppositeWordId,
            juktobornoId: q.juktobornoId,
            ekKothayProkashId: q.ekKothayProkashId,
            synonymId: q.synonymId,
            sadhuToCholitoId: q.sadhuToCholitoId,
            podNirnoyId: q.podNirnoyId,
            verbTenseId: q.verbTenseId,
            formFillupId: q.formFillupId,
            shuddhoAshuddhoId: q.shuddhoAshuddhoId,
            danBamMilkoronId: q.danBamMilkoronId,
            mathQuestionId: q.mathQuestionId,
            grammarQuestionId: q.grammarQuestionId,
            distributionId: newDistId,
            sectionId: newSecId,
            orderIndex: globalOrder++,
            assignedMarks: q.assignedMarks,
            overrides,
            contentSnapshot: q.contentSnapshot ?? null,
          },
        })

        if (q.alternatives && q.alternatives.length > 0) {
          for (const alt of q.alternatives) {
            const altDistId = distMap.get(alt.distributionId) || newDistId
            await tenantDb.questionPaperQuestion.create({
              data: {
                questionPaperId: createdPaper.id,
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
                poemEssenceId: alt.poemEssenceId,
                proseEssenceId: alt.proseEssenceId,
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
                descriptiveQuestionId: alt.descriptiveQuestionId,
                shortQuestionId: alt.shortQuestionId,
                makeQuestionId: alt.makeQuestionId,
                wordMeaningId: alt.wordMeaningId,
                numberInWordsId: alt.numberInWordsId,
                makeSentencesId: alt.makeSentencesId,
                oppositeWordId: alt.oppositeWordId,
                juktobornoId: alt.juktobornoId,
                ekKothayProkashId: alt.ekKothayProkashId,
                synonymId: alt.synonymId,
                sadhuToCholitoId: alt.sadhuToCholitoId,
                podNirnoyId: alt.podNirnoyId,
                verbTenseId: alt.verbTenseId,
                formFillupId: alt.formFillupId,
                shuddhoAshuddhoId: alt.shuddhoAshuddhoId,
                danBamMilkoronId: alt.danBamMilkoronId,
                mathQuestionId: alt.mathQuestionId,
                grammarQuestionId: alt.grammarQuestionId,
                distributionId: altDistId,
                sectionId: newSecId,
                orderIndex: createdPrimary.orderIndex,
                assignedMarks: alt.assignedMarks,
                orLabel: alt.orLabel || "অথবা",
                orOrder: alt.orOrder,
                contentSnapshot: alt.contentSnapshot ?? null,
              },
            })
          }
        }
      }
    }

    await logHistory(tenantDb, {
      questionPaperId: createdPaper.id,
      action: "CREATED",
      actorId,
      changes: { setCode, generatedFrom: source.id },
    })

    generatedPapers.push({
      id: createdPaper.id,
      title: createdPaper.title,
      setCode,
    })
  }

  return {
    success: true,
    generatedPapers,
  }
}
