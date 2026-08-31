import type { PrismaClient } from "@workspace/db/main"
import type { SaveSubjectStructureInput } from "./subject-structure.schema"

export async function saveSubjectStructure(
  db: PrismaClient,
  input: SaveSubjectStructureInput,
) {
  const { subjectId, sections } = input

  return db.$transaction(async (tx) => {
    // 1. Delete existing structure for this subject to prevent orphans
    await tx.subjectQuestionType.deleteMany({
      where: { subjectId },
    })
    await tx.subjectQuestionSubSection.deleteMany({
      where: {
        section: {
          subjectId,
        },
      },
    })
    await tx.subjectQuestionSection.deleteMany({
      where: { subjectId },
    })

    // 2. Create the new nested structure
    for (const sec of sections) {
      const createdSection = await tx.subjectQuestionSection.create({
        data: {
          subjectId,
          nameEn: sec.nameEn,
          nameBn: sec.nameBn,
          position: sec.position,
        },
      })

      // 2a. Insert direct question types if there are no sub-sections
      if (sec.questionTypes && sec.questionTypes.length > 0) {
        await tx.subjectQuestionType.createMany({
          data: sec.questionTypes.map((qt) => ({
            subjectId,
            sectionId: createdSection.id,
            questionTypeId: qt.questionTypeId,
            mark: qt.mark,
            requiredCount: qt.requiredCount,
            totalQuestions: qt.totalQuestions,
            markDistribution: qt.markDistribution ?? undefined,
          })),
        })
      }

      // 2b. Insert sub-sections and their corresponding question types
      for (const sub of sec.subSections) {
        const createdSubSection = await tx.subjectQuestionSubSection.create({
          data: {
            sectionId: createdSection.id,
            nameEn: sub.nameEn,
            nameBn: sub.nameBn,
            position: sub.position,
          },
        })

        if (sub.questionTypes && sub.questionTypes.length > 0) {
          await tx.subjectQuestionType.createMany({
            data: sub.questionTypes.map((qt) => ({
              subjectId,
              sectionId: createdSection.id,
              subSectionId: createdSubSection.id,
              questionTypeId: qt.questionTypeId,
              mark: qt.mark,
              requiredCount: qt.requiredCount,
              totalQuestions: qt.totalQuestions,
              markDistribution: qt.markDistribution ?? undefined,
            })),
          })
        }
      }
    }

    return { success: true }
  })
}
