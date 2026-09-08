import type { PrismaClient } from "@workspace/db/main"
import type { TenantPrismaClient } from "@workspace/db/tenant"
import { notFound } from "../../../utils/errors"
import type {
  UpsertQuestionPaperDistributionInput,
  DeleteQuestionPaperDistributionInput,
  UpdateDistributionLabelInput,
  GetDistributionStatusesInput,
} from "../question-paper.schema"
import { logHistory } from "./helpers/history-logger"
import { syncTotals, syncMarkDistribution } from "./helpers/totals-calculator"

export async function upsertQuestionPaperDistribution(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: UpsertQuestionPaperDistributionInput,
  actorId?: string
) {
  const subject = await tenantDb.questionPaperSubject.findUnique({
    where: { id: input.paperSubjectId },
  })
  if (!subject) throw notFound("QuestionPaperSubject")

  let sectionId: string | null = null
  let subSectionId: string | null = null

  const sqType = await db.subjectQuestionType.findFirst({
    where: {
      subjectId: subject.subjectId,
      questionTypeId: input.questionTypeId,
    },
    include: {
      subSection: true,
      section: true,
    },
  })

  if (sqType) {
    if (sqType.sectionId) {
      const mSec = await db.subjectQuestionSection.findUnique({
        where: { id: sqType.sectionId },
      })
      if (mSec) {
        const pSec = await tenantDb.questionPaperSection.findFirst({
          where: {
            questionPaperId: subject.questionPaperId,
            title: mSec.nameEn,
            titleBn: mSec.nameBn,
          },
        })
        if (pSec) sectionId = pSec.id
      }
    }

    if (sqType.subSectionId && sectionId) {
      const mSub = await db.subjectQuestionSubSection.findUnique({
        where: { id: sqType.subSectionId },
      })
      if (mSub) {
        const pSub = await tenantDb.questionPaperSubSection.findFirst({
          where: {
            sectionId,
            title: mSub.nameEn,
            titleBn: mSub.nameBn,
          },
        })
        if (pSub) subSectionId = pSub.id
      }
    }
  }

  const explicitSubSectionIds = input.subSectionIds || (input.subSectionId ? [input.subSectionId] : [])
  if (explicitSubSectionIds.length > 0) {
    const directSub = await tenantDb.questionPaperSubSection.findUnique({
      where: { id: explicitSubSectionIds[0] },
      include: { section: true },
    })
    if (directSub) {
      subSectionId = directSub.id
      sectionId = directSub.sectionId
    }
  } else if (input.sectionId) {
    sectionId = input.sectionId
  }

  let dist
  let isNew = true

  const markDistribution = syncMarkDistribution(
    input.marksPerQuestion,
    input.markDistribution,
    sqType?.markDistribution
  )

  const attemptCount = input.questionsToAttempt ?? input.questionCount
  const totalMarks = input.marksPerQuestion * attemptCount

  const qType = await db.questionType.findUnique({
    where: { id: input.questionTypeId },
    select: { nameBn: true, nameEn: true },
  })

  if (input.id) {
    const existing = await tenantDb.questionPaperSubjectMarkDistribution.findFirst({
      where: { id: input.id, paperSubjectId: input.paperSubjectId },
    })
    if (!existing) throw notFound("QuestionPaperSubjectMarkDistribution")
    isNew = false

    const newSectionId = input.sectionId !== undefined ? input.sectionId : existing.sectionId
    dist = await tenantDb.questionPaperSubjectMarkDistribution.update({
      where: { id: input.id },
      data: {
        questionTypeId: input.questionTypeId,
        questionTypeName: input.questionTypeName,
        questionTypeNameBn: input.questionTypeNameBn !== undefined ? input.questionTypeNameBn : (existing.questionTypeNameBn ?? qType?.nameBn ?? null),
        questionTypeLabel: input.questionTypeLabel ?? existing.questionTypeLabel,
        marksPerQuestion: input.marksPerQuestion,
        markDistribution: markDistribution as any,
        questionCount: input.questionCount,
        totalMarks,
        questionsToAttempt: input.questionsToAttempt ?? input.questionCount,
        orderIndex: input.orderIndex,
        sectionId: newSectionId,
      },
    })
  } else {
    dist = await tenantDb.questionPaperSubjectMarkDistribution.create({
      data: {
        paperSubjectId: input.paperSubjectId,
        questionTypeId: input.questionTypeId,
        questionTypeName: input.questionTypeName,
        questionTypeNameBn: input.questionTypeNameBn ?? qType?.nameBn ?? null,
        questionTypeLabel: input.questionTypeLabel,
        marksPerQuestion: input.marksPerQuestion,
        markDistribution: markDistribution as any,
        questionCount: input.questionCount,
        totalMarks,
        questionsToAttempt: input.questionsToAttempt ?? input.questionCount,
        orderIndex: input.orderIndex,
        sectionId,
      },
    })
  }

  let targetSecId = dist.sectionId
  let targetSubIds: string[] = []

  if (input.subSectionIds && input.subSectionIds.length > 0) {
    targetSubIds = input.subSectionIds
  } else if (input.subSectionId) {
    targetSubIds = [input.subSectionId]
  } else if (subSectionId) {
    targetSubIds = [subSectionId]
  } else if (targetSecId && sqType?.subSection) {
    const candidateSubs = await tenantDb.questionPaperSubSection.findMany({
      where: {
        sectionId: targetSecId,
        title: sqType.subSection.nameEn,
        titleBn: sqType.subSection.nameBn,
      },
      orderBy: { orderIndex: "asc" },
    })
    targetSubIds = candidateSubs.map((s) => s.id)
  }

  if (input.id) {
    await tenantDb.questionPaperSubSectionDistribution.deleteMany({
      where: { distributionId: dist.id },
    })
  }

  for (const sId of targetSubIds) {
    await tenantDb.questionPaperSubSectionDistribution.upsert({
      where: {
        subSectionId_distributionId: {
          subSectionId: sId,
          distributionId: dist.id,
        },
      },
      create: {
        subSectionId: sId,
        distributionId: dist.id,
      },
      update: {},
    }).catch(() => { })
  }

  if (targetSubIds.length > 0) {
    if (input.id && input.subSectionId && input.questionsToAttempt !== undefined && input.questionsToAttempt !== null) {
      await tenantDb.questionPaperSubSection.update({
        where: { id: input.subSectionId },
        data: { questionsToAttempt: input.questionsToAttempt },
      }).catch(() => { })
    } else {
      const isSharedType = targetSubIds.length > 1
      const secSubs = targetSecId ? await tenantDb.questionPaperSubSection.findMany({ where: { sectionId: targetSecId } }) : []
      if (isSharedType || secSubs.length > 1) {
        for (const subId of targetSubIds) {
          await tenantDb.questionPaperSubSection.update({
            where: { id: subId },
            data: { questionsToAttempt: 0 },
          }).catch(() => { })
        }
      } else {
        const attemptVal = input.questionsToAttempt ?? dist.questionsToAttempt ?? dist.questionCount ?? 0
        await tenantDb.questionPaperSubSection.update({
          where: { id: targetSubIds[0] },
          data: { questionsToAttempt: attemptVal },
        }).catch(() => { })
      }
    }
  }

  if (targetSecId) {
    const secSubs = await tenantDb.questionPaperSubSection.findMany({
      where: { sectionId: targetSecId },
      select: { questionsToAttempt: true },
    })

    const secAttemptSum = secSubs.reduce((sum, s) => sum + (s.questionsToAttempt || 0), 0)
    const finalSecAttempt = secAttemptSum > 0 ? secAttemptSum : (input.questionsToAttempt ?? input.questionCount)

    await tenantDb.questionPaperSection.update({
      where: { id: targetSecId },
      data: {
        questionsToAttempt: finalSecAttempt ?? undefined,
      },
    }).catch(() => { })
  }

  await syncTotals(tenantDb, subject.questionPaperId, subject.id)

  await logHistory(tenantDb, {
    questionPaperId: subject.questionPaperId,
    action: isNew ? "DISTRIBUTION_ADDED" : "DISTRIBUTION_UPDATED",
    actorId,
    changes: { distId: dist.id, typeName: dist.questionTypeName, totalMarks: dist.totalMarks },
  })

  return dist
}

export async function deleteQuestionPaperDistribution(
  tenantDb: TenantPrismaClient,
  input: DeleteQuestionPaperDistributionInput,
  actorId?: string
) {
  const existing = await tenantDb.questionPaperSubjectMarkDistribution.findUnique({
    where: { id: input.id },
    include: {
      paperSubject: true,
    },
  })
  if (!existing || existing.paperSubject.questionPaperId !== input.questionPaperId) {
    throw notFound("QuestionPaperSubjectMarkDistribution")
  }

  await tenantDb.questionPaperSubjectMarkDistribution.delete({
    where: { id: input.id },
  })

  await syncTotals(tenantDb, input.questionPaperId, existing.paperSubjectId)

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "DISTRIBUTION_REMOVED",
    actorId,
    changes: { distId: input.id, typeName: existing.questionTypeName },
  })

  return { success: true }
}

export async function updateDistributionLabel(
  tenantDb: TenantPrismaClient,
  input: UpdateDistributionLabelInput,
  actorId?: string
) {
  const existing = await tenantDb.questionPaperSubjectMarkDistribution.findUnique({
    where: { id: input.id },
    include: {
      paperSubject: true,
    },
  })
  if (!existing || existing.paperSubject.questionPaperId !== input.questionPaperId) {
    throw notFound("QuestionPaperSubjectMarkDistribution")
  }

  const updated = await tenantDb.questionPaperSubjectMarkDistribution.update({
    where: { id: input.id },
    data: {
      questionTypeLabel: input.questionTypeLabel,
    },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "DISTRIBUTION_UPDATED",
    actorId,
    changes: {
      distId: input.id,
      typeName: existing.questionTypeName,
      questionTypeLabel: input.questionTypeLabel,
    },
  })

  return updated
}

export async function getQuestionPaperDistributionStatuses(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: GetDistributionStatusesInput
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
    include: {
      subjects: {
        orderBy: { id: "asc" },
        include: {
          distributions: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      questions: true,
    },
  })

  if (!paper || paper.deletedAt) {
    throw notFound("QuestionPaper")
  }

  const questionTypeIds = Array.from(
    new Set(paper.subjects.flatMap((s) => s.distributions.map((d) => d.questionTypeId)).filter(Boolean))
  )
  const questionTypes = await db.questionType.findMany({
    where: { id: { in: questionTypeIds } },
  })
  const qTypeMap = new Map(questionTypes.map((t) => [t.id, t]))

  const countsByDist = new Map<string, number>()
  const altCountsByDist = new Map<string, number>()
  for (const q of paper.questions) {
    if (q.parentQuestionId) {
      const cur = altCountsByDist.get(q.distributionId) || 0
      altCountsByDist.set(q.distributionId, cur + 1)
    } else {
      const cur = countsByDist.get(q.distributionId) || 0
      countsByDist.set(q.distributionId, cur + 1)
    }
  }

  const statuses: Array<{
    distributionId: string
    paperSubjectId: string
    subjectId: string
    subjectName: string
    questionTypeId: string
    questionTypeName: string
    questionTypeNameBn: string | null
    questionTypeLabel: string | null
    targetCount: number
    addedCount: number
    alternativeCount: number
    marksPerQuestion: number
    markDistribution: any
    totalMarks: number
    status: "COMPLETED" | "ACTIVE" | "LOCKED" | "INCOMPLETE"
    sectionId: string | null
    subSectionId: string | null
    subSectionIds?: string[]
    questionType: any
  }> = []

  for (const sub of paper.subjects) {
    for (const dist of sub.distributions) {
      const addedCount = countsByDist.get(dist.id) || 0
      const altCount = altCountsByDist.get(dist.id) || 0
      const targetCount = dist.questionCount

      const isComplete = addedCount >= targetCount && targetCount > 0
      const status: "COMPLETED" | "ACTIVE" | "LOCKED" | "INCOMPLETE" = isComplete ? "COMPLETED" : "ACTIVE"

      statuses.push({
        distributionId: dist.id,
        paperSubjectId: sub.id,
        subjectId: sub.subjectId,
        subjectName: sub.subjectName,
        questionTypeId: dist.questionTypeId,
        questionTypeName: dist.questionTypeName,
        questionTypeNameBn: (dist as any).questionTypeNameBn || null,
        questionTypeLabel: dist.questionTypeLabel || null,
        targetCount,
        addedCount,
        alternativeCount: altCount,
        marksPerQuestion: dist.marksPerQuestion,
        markDistribution: dist.markDistribution || null,
        totalMarks: dist.totalMarks,
        status,
        sectionId: dist.sectionId || null,
        subSectionId: (dist as any).subSections?.[0]?.subSectionId || null,
        subSectionIds: (dist as any).subSections?.map((s: any) => s.subSectionId) || [],
        questionType: qTypeMap.get(dist.questionTypeId) || null,
      })
    }
  }

  return statuses
}
