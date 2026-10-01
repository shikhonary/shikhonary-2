import type { PrismaClient } from "@workspace/db/main"
import type { TenantPrismaClient } from "@workspace/db/tenant"

export async function freezeQuestionSnapshots(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  questionPaperId: string
) {
  const paperQuestions = await tenantDb.questionPaperQuestion.findMany({
    where: { questionPaperId },
  })

  for (const pq of paperQuestions) {
    let content: any = null

    if (pq.mcqId) {
      content = await db.mcq.findUnique({ where: { id: pq.mcqId } })
    } else if (pq.cqId) {
      content = await db.cq.findUnique({ where: { id: pq.cqId } })
    } else if (pq.shortAnswerId) {
      content = await db.shortAnswer.findUnique({ where: { id: pq.shortAnswerId } })
    } else if (pq.csId) {
      content = await (db as any).cS.findUnique({ where: { id: pq.csId } })
    } else if (pq.paragraphId) {
      content = await db.paragraph.findUnique({ where: { id: pq.paragraphId } })
    } else if (pq.amplificationId) {
      content = await db.amplification.findUnique({ where: { id: pq.amplificationId } })
    } else if (pq.letterId) {
      content = await (db as any).letter.findUnique({ where: { id: pq.letterId } })
    } else if (pq.applicationId) {
      content = await (db as any).application.findUnique({ where: { id: pq.applicationId } })
    } else if (pq.summaryId) {
      content = await (db as any).summary.findUnique({ where: { id: pq.summaryId } })
    } else if (pq.essenceId) {
      content = await (db as any).essence.findUnique({ where: { id: pq.essenceId } })
    } else if (pq.poemEssenceId) {
      content = await (db as any).poemEssence.findUnique({ where: { id: pq.poemEssenceId } })
    } else if (pq.proseEssenceId) {
      content = await (db as any).proseEssence.findUnique({ where: { id: pq.proseEssenceId } })
    } else if (pq.poemId) {
      content = await (db as any).poem.findUnique({ where: { id: pq.poemId } })
    } else if (pq.essayId) {
      content = await (db as any).essay.findUnique({ where: { id: pq.essayId } })
    } else if (pq.newsReportId) {
      content = await (db as any).newsReport.findUnique({ where: { id: pq.newsReportId } })
    } else if (pq.partsOfSpeechId) {
      content = await db.partsOfSpeech.findUnique({ where: { id: pq.partsOfSpeechId } })
    } else if (pq.rightFormOfVerbId) {
      content = await (db as any).rightFormOfVerb.findUnique({ where: { id: pq.rightFormOfVerbId } })
    } else if (pq.changingSentenceId) {
      content = await (db as any).changingSentence.findUnique({ where: { id: pq.changingSentenceId } })
    } else if (pq.fillInTheBlanksWithCluesId) {
      content = await db.fillInTheBlanksWithClues.findUnique({ where: { id: pq.fillInTheBlanksWithCluesId } })
    } else if (pq.substitutionTableId) {
      content = await db.substitutionTable.findUnique({ where: { id: pq.substitutionTableId } })
    } else if (pq.punctuationId) {
      content = await (db as any).punctuation.findUnique({ where: { id: pq.punctuationId } })
    } else if (pq.shortCompositionId) {
      content = await (db as any).shortComposition.findUnique({ where: { id: pq.shortCompositionId } })
    } else if (pq.descriptiveQuestionId) {
      content = await (db as any).descriptiveQuestion.findUnique({ where: { id: pq.descriptiveQuestionId } })
    } else if (pq.shortQuestionId) {
      content = await (db as any).shortQuestion.findUnique({ where: { id: pq.shortQuestionId } })
    } else if (pq.makeQuestionId) {
      content = await (db as any).makeQuestion.findUnique({ where: { id: pq.makeQuestionId } })
    } else if (pq.wordMeaningId) {
      content = await (db as any).wordMeaning.findUnique({ where: { id: pq.wordMeaningId } })
    } else if (pq.makeSentencesId) {
      content = await (db as any).makeSentences.findUnique({ where: { id: pq.makeSentencesId } })
    } else if (pq.oppositeWordId) {
      content = await (db as any).oppositeWord.findUnique({ where: { id: pq.oppositeWordId } })
    } else if (pq.juktobornoId) {
      content = await (db as any).juktoborno.findUnique({ where: { id: pq.juktobornoId } })
    } else if (pq.ekKothayProkashId) {
      content = await (db as any).ekKothayProkash.findUnique({ where: { id: pq.ekKothayProkashId } })
    } else if (pq.synonymId) {
      content = await (db as any).synonym.findUnique({ where: { id: pq.synonymId } })
    } else if (pq.sadhuToCholitoId) {
      content = await (db as any).sadhuToCholito.findUnique({ where: { id: pq.sadhuToCholitoId } })
    } else if (pq.podNirnoyId) {
      content = await (db as any).podNirnoy.findUnique({ where: { id: pq.podNirnoyId } })
    } else if (pq.verbTenseId) {
      content = await (db as any).verbTense.findUnique({ where: { id: pq.verbTenseId } })
    } else if (pq.formFillupId) {
      content = await (db as any).formFillup.findUnique({ where: { id: pq.formFillupId } })
    }

    if (content) {
      await tenantDb.questionPaperQuestion.update({
        where: { id: pq.id },
        data: {
          contentSnapshot: JSON.parse(JSON.stringify(content)),
        },
      })
    }
  }
}
