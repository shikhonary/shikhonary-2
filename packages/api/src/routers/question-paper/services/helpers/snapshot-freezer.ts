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
