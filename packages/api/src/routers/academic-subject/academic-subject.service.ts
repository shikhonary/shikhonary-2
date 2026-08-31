import type { PrismaClient } from "@workspace/db/main"
import { notFound } from "../../utils/errors"
import type {
  CreateAcademicSubjectInput,
  DeleteAcademicSubjectInput,
  GetAcademicSubjectInput,
  ListAcademicSubjectsInput,
  UpdateAcademicSubjectInput,
  SaveSubjectQuestionTypesInput,
} from "./academic-subject.schema"

export async function listAcademicSubjects(
  db: PrismaClient,
  input: ListAcademicSubjectsInput,
) {
  const where: any = {}
  if (input.academicYearId) where.academicYearId = input.academicYearId
  if (input.classId) {
    where.classSubjects = {
      some: {
        classId: input.classId,
      },
    }
  }
  if (typeof input.isActive === "boolean") where.isActive = input.isActive

  if (input.query) {
    where.OR = [
      { nameEn: { contains: input.query, mode: "insensitive" } },
      { nameBn: { contains: input.query, mode: "insensitive" } },
      { code: { contains: input.query, mode: "insensitive" } },
      { group: { contains: input.query, mode: "insensitive" } },
    ]
  }

  let orderBy: any = { nameEn: "asc" }
  if (input.sort === "name_asc") {
    orderBy = { nameEn: "asc" }
  } else if (input.sort === "name_desc") {
    orderBy = { nameEn: "desc" }
  } else if (input.sort === "code_asc") {
    orderBy = { code: "asc" }
  } else if (input.sort === "code_desc") {
    orderBy = { code: "desc" }
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [academicSubjects, totalItems] = await Promise.all([
    db.academicSubject.findMany({
      where,
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy,
      include: {
        academicYear: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
          },
        },
        _count: {
          select: {
            subjectQuestionTypes: true,
          },
        },
      },
    }),
    db.academicSubject.count({ where }),
  ])

  const nextCursor =
    academicSubjects.length === limit
      ? academicSubjects[academicSubjects.length - 1]?.id
      : undefined

  return {
    academicSubjects,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
    nextCursor,
  }
}

export async function getAcademicSubjectById(
  db: PrismaClient,
  input: GetAcademicSubjectInput,
) {
  const academicSubject = await db.academicSubject.findUnique({
    where: { id: input.id },
    include: {
      classSubjects: {
        select: {
          classId: true,
        },
      },
      subjectQuestionTypes: {
        select: {
          id: true,
          questionTypeId: true,
          sectionId: true,
          subSectionId: true,
          mark: true,
          totalQuestions: true,
          requiredCount: true,
          markDistribution: true,
        },
      },
      sections: {
        orderBy: {
          position: "asc",
        },
        include: {
          subSections: {
            orderBy: {
              position: "asc",
            },
            include: {
              subjectQuestionTypes: {
                include: {
                  questionType: true,
                },
              },
            },
          },
          subjectQuestionTypes: {
            include: {
              questionType: true,
            },
          },
        },
      },
    },
  })
  if (!academicSubject) throw notFound("AcademicSubject")
  return academicSubject
}

export async function createAcademicSubject(
  db: PrismaClient,
  input: CreateAcademicSubjectInput,
) {
  const { classIds, ...data } = input
  return db.academicSubject.create({
    data: {
      ...data,
      classSubjects: classIds && classIds.length > 0 ? {
        create: classIds.map((classId) => ({
          classId,
        })),
      } : undefined,
    },
  })
}

export async function updateAcademicSubject(
  db: PrismaClient,
  input: UpdateAcademicSubjectInput,
) {
  const { id, classIds, ...data } = input
  const existing = await db.academicSubject.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw notFound("AcademicSubject")

  return db.academicSubject.update({
    where: { id },
    data: {
      ...data,
      classSubjects: classIds ? {
        deleteMany: {},
        create: classIds.map((classId) => ({
          classId,
        })),
      } : undefined,
    },
  })
}

export async function deleteAcademicSubject(
  db: PrismaClient,
  input: DeleteAcademicSubjectInput,
) {
  const existing = await db.academicSubject.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("AcademicSubject")

  await db.academicSubject.delete({ where: { id: input.id } })
  return { success: true }
}

export async function toggleAcademicSubjectStatus(
  db: PrismaClient,
  input: GetAcademicSubjectInput,
) {
  const existing = await db.academicSubject.findUnique({
    where: { id: input.id },
    select: { id: true, isActive: true },
  })
  if (!existing) throw notFound("AcademicSubject")

  return db.academicSubject.update({
    where: { id: input.id },
    data: { isActive: !existing.isActive },
  })
}

export async function saveSubjectQuestionTypes(
  db: PrismaClient,
  input: SaveSubjectQuestionTypesInput,
) {
  const { subjectId, questionTypes } = input
  console.log("saveSubjectQuestionTypes input on server:", JSON.stringify(questionTypes, null, 2))
  const existing = await db.academicSubject.findUnique({
    where: { id: subjectId },
    select: { id: true },
  })
  if (!existing) throw notFound("AcademicSubject")

  return db.$transaction(async (tx) => {
    // Delete all current associations
    await tx.subjectQuestionType.deleteMany({
      where: { subjectId },
    })

    // Insert new associations
    if (questionTypes.length > 0) {
      await tx.subjectQuestionType.createMany({
        data: questionTypes.map((qt) => ({
          subjectId,
          questionTypeId: qt.questionTypeId,
          mark: qt.mark,
          requiredCount: qt.requiredCount,
          totalQuestions: qt.totalQuestions,
          markDistribution: qt.markDistribution ?? undefined,
        })),
      })
    }

    return { success: true }
  })
}

