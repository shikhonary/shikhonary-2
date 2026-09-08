import type { PrismaClient } from "@workspace/db/main"
import type { TenantPrismaClient } from "@workspace/db/tenant"
import { notFound } from "../../../utils/errors"
import type {
  UpsertQuestionPaperSectionInput,
  DeleteQuestionPaperSectionInput,
  UpsertQuestionPaperSubSectionInput,
  DeleteQuestionPaperSubSectionInput,
  UpsertQuestionPaperSubjectInput,
  DeleteQuestionPaperSubjectInput,
} from "../question-paper.schema"
import { logHistory } from "./helpers/history-logger"

export async function upsertQuestionPaperSection(
  tenantDb: TenantPrismaClient,
  input: UpsertQuestionPaperSectionInput,
  actorId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  })
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper")

  let section
  let isNew = true

  if (input.id) {
    const existing = await tenantDb.questionPaperSection.findFirst({
      where: { id: input.id, questionPaperId: input.questionPaperId },
    })
    if (!existing) throw notFound("QuestionPaperSection")
    isNew = false

    section = await tenantDb.questionPaperSection.update({
      where: { id: input.id },
      data: {
        title: input.title,
        titleBn: input.titleBn,
        instructions: input.instructions,
        orderIndex: input.orderIndex,
      },
    })
  } else {
    section = await tenantDb.questionPaperSection.create({
      data: {
        questionPaperId: input.questionPaperId,
        title: input.title,
        titleBn: input.titleBn,
        instructions: input.instructions,
        orderIndex: input.orderIndex,
      },
    })
  }

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: isNew ? "SECTION_ADDED" : "SECTION_UPDATED",
    actorId,
    changes: { sectionId: section.id, title: section.title },
  })

  return section
}

export async function deleteQuestionPaperSection(
  tenantDb: TenantPrismaClient,
  input: DeleteQuestionPaperSectionInput,
  actorId?: string
) {
  const existing = await tenantDb.questionPaperSection.findFirst({
    where: { id: input.id, questionPaperId: input.questionPaperId },
  })
  if (!existing) throw notFound("QuestionPaperSection")

  await tenantDb.questionPaperSection.delete({
    where: { id: input.id },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "SECTION_REMOVED",
    actorId,
    changes: { sectionId: input.id, title: existing.title },
  })

  return { success: true }
}

export async function upsertQuestionPaperSubSection(
  tenantDb: TenantPrismaClient,
  input: UpsertQuestionPaperSubSectionInput,
) {
  let sub
  if (input.id) {
    const existing = await tenantDb.questionPaperSubSection.findUnique({
      where: { id: input.id },
    })
    if (!existing) throw notFound("QuestionPaperSubSection")

    sub = await tenantDb.questionPaperSubSection.update({
      where: { id: input.id },
      data: {
        title: input.title !== undefined ? input.title : existing.title,
        titleBn: input.titleBn !== undefined ? input.titleBn : existing.titleBn,
        instructions: input.instructions !== undefined ? input.instructions : existing.instructions,
        questionsToAttempt: input.questionsToAttempt !== undefined ? input.questionsToAttempt : existing.questionsToAttempt,
        orderIndex: input.orderIndex !== undefined ? input.orderIndex : existing.orderIndex,
      },
    })
  } else {
    sub = await tenantDb.questionPaperSubSection.create({
      data: {
        sectionId: input.sectionId!,
        title: input.title || "Sub-section",
        titleBn: input.titleBn,
        instructions: input.instructions,
        questionsToAttempt: input.questionsToAttempt ?? 0,
        orderIndex: input.orderIndex ?? 0,
      },
    })
  }

  return sub
}

export async function deleteQuestionPaperSubSection(
  tenantDb: TenantPrismaClient,
  input: DeleteQuestionPaperSubSectionInput,
) {
  const existing = await tenantDb.questionPaperSubSection.findUnique({
    where: { id: input.id },
  })
  if (!existing) throw notFound("QuestionPaperSubSection")

  await tenantDb.questionPaperSubSection.delete({
    where: { id: input.id },
  })

  return { success: true }
}

export async function upsertQuestionPaperSubject(
  db: PrismaClient,
  tenantDb: TenantPrismaClient,
  input: UpsertQuestionPaperSubjectInput,
  actorId?: string
) {
  const paper = await tenantDb.questionPaper.findUnique({
    where: { id: input.questionPaperId },
  })
  if (!paper || paper.deletedAt) throw notFound("QuestionPaper")

  let subject
  let isNew = true

  if (input.id) {
    const existing = await tenantDb.questionPaperSubject.findFirst({
      where: { id: input.id, questionPaperId: input.questionPaperId },
    })
    if (!existing) throw notFound("QuestionPaperSubject")
    isNew = false

    subject = await tenantDb.questionPaperSubject.update({
      where: { id: input.id },
      data: {
        subjectId: input.subjectId,
        subjectName: input.subjectName,
        orderIndex: input.orderIndex ?? 0,
        subjectTotal: input.subjectTotal,
      },
    })
  } else {
    subject = await tenantDb.questionPaperSubject.create({
      data: {
        questionPaperId: input.questionPaperId,
        subjectId: input.subjectId,
        subjectName: input.subjectName,
        orderIndex: input.orderIndex ?? 0,
        subjectTotal: input.subjectTotal,
      },
    })

    const definedTypeIds = input.questionTypeIds && input.questionTypeIds.length > 0
      ? new Set(input.questionTypeIds)
      : null

    const mainSections = await db.subjectQuestionSection.findMany({
      where: { subjectId: input.subjectId },
      include: {
        subSections: {
          include: {
            subjectQuestionTypes: true,
          },
          orderBy: { position: "asc" },
        },
        subjectQuestionTypes: true,
      },
      orderBy: { position: "asc" },
    })

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

      if (!shouldCreateSection) {
        continue
      }

      let pSection = await tenantDb.questionPaperSection.findFirst({
        where: {
          questionPaperId: input.questionPaperId,
          title: mSec.nameEn,
          titleBn: mSec.nameBn,
        },
      })
      if (!pSection) {
        pSection = await tenantDb.questionPaperSection.create({
          data: {
            questionPaperId: input.questionPaperId,
            title: mSec.nameEn,
            titleBn: mSec.nameBn,
            orderIndex: mSec.position,
            instructions: mSec.instructions ?? null,
            questionsToAttempt: null,
          },
        })
      } else if (!pSection.instructions && mSec.instructions) {
        pSection = await tenantDb.questionPaperSection.update({
          where: { id: pSection.id },
          data: {
            instructions: mSec.instructions ?? pSection.instructions,
          },
        })
      }

      const typeCounts = new Map<string, number>()
      if (input.questionTypeIds) {
        for (const tid of input.questionTypeIds) {
          typeCounts.set(tid, (typeCounts.get(tid) || 0) + 1)
        }
      }

      for (const mSub of validSubSectionsToCreate) {
        const subTypeIds = mSub.subjectQuestionTypes.map((sqt) => sqt.questionTypeId)
        let requiredInstances = 1
        if (input.questionTypeIds && subTypeIds.length > 0) {
          const matchingCounts = subTypeIds.map((tid) => typeCounts.get(tid) || 0)
          const maxCount = Math.max(...matchingCounts)
          if (maxCount > 0) requiredInstances = maxCount
        }

        const existingSubs = await tenantDb.questionPaperSubSection.findMany({
          where: {
            sectionId: pSection.id,
            title: mSub.nameEn,
            titleBn: mSub.nameBn,
          },
          orderBy: { orderIndex: "asc" },
        })

        const needed = Math.max(1, requiredInstances) - existingSubs.length
        for (let i = 0; i < needed; i++) {
          await tenantDb.questionPaperSubSection.create({
            data: {
              sectionId: pSection.id,
              title: mSub.nameEn,
              titleBn: mSub.nameBn,
              orderIndex: mSub.position + existingSubs.length + i,
              instructions: mSub.instructions ?? null,
              questionsToAttempt: 0,
            },
          })
        }
      }
    }
  }

  const subjects = await tenantDb.questionPaperSubject.findMany({
    where: { questionPaperId: input.questionPaperId },
    select: { subjectTotal: true },
  })
  const paperTotal = subjects.reduce((sum, s) => sum + s.subjectTotal, 0)
  await tenantDb.questionPaper.update({
    where: { id: input.questionPaperId },
    data: { total: paperTotal },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: isNew ? "SUBJECT_ADDED" : "SUBJECT_UPDATED",
    actorId,
    changes: { subjectId: subject.id, name: subject.subjectName },
  })

  return subject
}

export async function deleteQuestionPaperSubject(
  tenantDb: TenantPrismaClient,
  input: DeleteQuestionPaperSubjectInput,
  actorId?: string
) {
  const existing = await tenantDb.questionPaperSubject.findFirst({
    where: { id: input.id, questionPaperId: input.questionPaperId },
  })
  if (!existing) throw notFound("QuestionPaperSubject")

  await tenantDb.questionPaperSubject.delete({
    where: { id: input.id },
  })

  const subjects = await tenantDb.questionPaperSubject.findMany({
    where: { questionPaperId: input.questionPaperId },
    select: { subjectTotal: true },
  })
  const paperTotal = subjects.reduce((sum, s) => sum + s.subjectTotal, 0)
  await tenantDb.questionPaper.update({
    where: { id: input.questionPaperId },
    data: { total: paperTotal },
  })

  await logHistory(tenantDb, {
    questionPaperId: input.questionPaperId,
    action: "SUBJECT_REMOVED",
    actorId,
    changes: { subjectId: input.id, name: existing.subjectName },
  })

  return { success: true }
}
